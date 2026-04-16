import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { domainStore } from './domainStore.js';
import { phoneSignals } from './utilities/phoneSignals.js';
import { agent } from './agent.js';
import { browser, BrowserSession } from './browser/index.js';
import { instance } from './browser/instance.js';
import { config } from './config.js';
import { stashStore } from './stashStore.js';
import type { AgentEvent } from './types/agent.js';
import type { ClassificationProposal, DomainCandidate } from './types/tools.js';
import type { ActiveRunSummary, CurrentRunState, PublicState, RunMode, StashedRun } from './types/state.js';

const app = express();
const store = domainStore.create();
const streamClients = new Set<Response>();
const skippedDomains = new Set<string>();
const browserSessions = new Map<string, BrowserSession>();
/** Temporary browser session opened for stash inspection (not a real run). */
let previewSession: BrowserSession | null = null;

let isRunning = false;
let runMode: RunMode = 'manual';
let currentRuns: Map<string, CurrentRunState> = new Map();
/** Domain of the run currently shown in full detail in the UI (includes events in SSE). */
let focusedDomain: string | null = null;
const activeAbortControllers = new Map<string, AbortController>();
const MAX_CONCURRENT = config.concurrency;

app.use(cors());
app.use(express.json());

const getActiveRunSummaries = (): ActiveRunSummary[] =>
  [...currentRuns.values()].map((run) => ({
    domain: run.domain,
    source: run.source,
    siteNames: run.siteNames,
    status: run.status,
    proposal: run.proposal,
  }));

const getFocusedRun = (): CurrentRunState | null => {
  if (focusedDomain) {
    const run = currentRuns.get(focusedDomain);
    if (run) {
      return {
        ...run,
        events: [...run.events],
        page: run.page ? { ...run.page, actionableElements: [...run.page.actionableElements] } : null,
        proposal: run.proposal ? { ...run.proposal } : null,
      };
    }
  }

  // Fall back to first active run
  const firstRun = currentRuns.values().next().value;
  if (!firstRun) {
    return null;
  }

  return {
    ...firstRun,
    events: [...firstRun.events],
    page: firstRun.page ? { ...firstRun.page, actionableElements: [...firstRun.page.actionableElements] } : null,
    proposal: firstRun.proposal ? { ...firstRun.proposal } : null,
  };
};

const getState = (): PublicState => ({
  running: isRunning,
  pausing: !isRunning && currentRuns.size > 0,
  runMode,
  done: currentRuns.size === 0 && store.getRemainingCount(skippedDomains) === 0,
  current: getFocusedRun(),
  activeRuns: getActiveRunSummaries(),
  remaining: store.getRemainingCount(skippedDomains),
  total: store.getTotalCount(),
  stashedCount: stashStore.count(),
  countries: [...phoneSignals.ALL_COUNTRY_CODES],
});

const broadcastState = (): void => {
  const payload = `data: ${JSON.stringify(getState())}\n\n`;
  for (const client of streamClients) {
    client.write(payload);
  }
};

const appendEvent = (domain: string, event: AgentEvent, page = currentRuns.get(domain)?.page ?? null): void => {
  const runState = currentRuns.get(domain);
  if (!runState) {
    return;
  }

  const existingIndex = runState.events.findIndex((item) => item.id === event.id);
  if (existingIndex >= 0) {
    runState.events = runState.events.map((item, index) => index === existingIndex ? event : item);
  } else {
    runState.events = [...runState.events, event].slice(-80);
  }

  runState.page = page;
  broadcastState();
};

const setCurrentRun = (domain: string, run: CurrentRunState | null): void => {
  if (run === null) {
    currentRuns.delete(domain);
    if (focusedDomain === domain) {
      focusedDomain = currentRuns.keys().next().value ?? null;
    }
  } else {
    currentRuns.set(domain, run);
    if (!focusedDomain) {
      focusedDomain = domain;
    }
  }

  broadcastState();
};

const closeDomainBrowser = async (domain: string): Promise<void> => {
  const session = browserSessions.get(domain);
  if (session) {
    await browser.closeSession(session);
    browserSessions.delete(domain);
  }
};

const normalizeCountryCode = (country: string | null | undefined): string | null => {
  if (!country) {
    return null;
  }

  const normalized = country.trim().toLowerCase();
  if (!normalized || ['unknown', 'n/a', 'none', 'null'].includes(normalized)) {
    return null;
  }

  if (!phoneSignals.ALL_COUNTRY_CODES.some((countryCode) => countryCode === normalized)) {
    return null;
  }

  return normalized;
};

const saveProposal = (domain: string, proposal: ClassificationProposal): void => {
  if (proposal.kind === 'escort') {
    const country = normalizeCountryCode(proposal.country);
    if (!country) {
      throw new Error('Escort classifications require a country.');
    }

    store.mapEscort(domain, country);
    return;
  }

  if (proposal.kind === 'bad') {
    store.mapBad(domain);
  }
};

const saveStashedProposal = (domain: string, siteNames: string[], proposal: ClassificationProposal): void => {
  if (proposal.kind === 'escort') {
    const country = normalizeCountryCode(proposal.country);
    if (!country) {
      throw new Error('Escort classifications require a country.');
    }

    store.mapEscortDirect(domain, country, siteNames);
    return;
  }

  if (proposal.kind === 'bad') {
    store.mapBadDirect(domain);
  }
};

const createRunState = (candidate: DomainCandidate): CurrentRunState => {
  return {
    domain: candidate.domain,
    source: candidate.source ?? null,
    siteNames: candidate.siteNames,
    suggestedCountry: store.getSuggestedCountry(candidate.domain),
    status: 'processing',
    events: [],
    page: null,
    proposal: null,
  };
};

const stashRun = async (runState: CurrentRunState): Promise<void> => {
  const session = browserSessions.get(runState.domain);
  const html = session ? await session.getHtml().catch(() => '') : '';

  const stashedRun: StashedRun = {
    domain: runState.domain,
    source: runState.source,
    siteNames: runState.siteNames,
    suggestedCountry: runState.suggestedCountry,
    proposal: runState.proposal!,
    events: [...runState.events],
    page: runState.page,
    html,
    stashedAt: new Date().toISOString(),
  };

  stashStore.add(stashedRun);
};

const processCandidate = async (candidate: DomainCandidate, runState: CurrentRunState): Promise<void> => {
  let browserSession: BrowserSession | null = null;
  const abortController = new AbortController();
  activeAbortControllers.set(candidate.domain, abortController);

  try {
    // Close any stash preview tab before opening a real session
    if (previewSession) {
      await previewSession.close().catch(() => null);
      previewSession = null;
    }

    browserSession = await browser.createSession(candidate.domain);
    browserSessions.set(candidate.domain, browserSession);

    const siblingEscortDomains = store.getSiblingEscortDomains(candidate.domain);

    const result = await agent.run(
      candidate,
      browserSession,
      (event, page) => {
        appendEvent(candidate.domain, event, page ?? currentRuns.get(candidate.domain)?.page ?? null);
      },
      abortController.signal,
      store.getSiblingBadDomains(candidate.domain),
      siblingEscortDomains,
    );

    runState.proposal = result.proposal;
    runState.page = result.page;

    if (runMode === 'run_all') {
      runState.status = 'saving';
      broadcastState();
      await stashRun(runState);
      appendEvent(
        candidate.domain,
        {
          id: `stashed-${candidate.domain}-${Date.now()}`,
          state: 'done',
          type: 'status',
          message: `Stashed ${candidate.domain} as ${result.proposal.kind} for review.`,
          createdAt: new Date().toISOString(),
        },
        runState.page ?? null,
      );
      await closeDomainBrowser(candidate.domain);
      setCurrentRun(candidate.domain, null);
      return;
    }

    if (runMode === 'auto_accept') {
      const isHighConfidence = result.proposal.confidence >= config.confidenceThreshold;

      if (result.proposal.kind === 'review' || !isHighConfidence) {
        runState.status = 'saving';
        broadcastState();
        await stashRun(runState);
        appendEvent(
          candidate.domain,
          {
            id: `stashed-${candidate.domain}-${Date.now()}`,
            state: 'done',
            type: 'status',
            message: `Stashed ${candidate.domain} for review (kind=${result.proposal.kind}, confidence=${result.proposal.confidence}).`,
            createdAt: new Date().toISOString(),
          },
          runState.page ?? null,
        );
        await closeDomainBrowser(candidate.domain);
        setCurrentRun(candidate.domain, null);
        return;
      }

      runState.status = 'saving';
      broadcastState();
      saveProposal(candidate.domain, result.proposal);
      appendEvent(
        candidate.domain,
        {
          id: `autosave-${candidate.domain}-${Date.now()}`,
          state: 'done',
          type: 'status',
          message: `Auto-saved ${candidate.domain} as ${result.proposal.kind}.`,
          createdAt: new Date().toISOString(),
        },
        runState.page ?? null,
      );
      await closeDomainBrowser(candidate.domain);
      setCurrentRun(candidate.domain, null);
      return;
    }

    // manual mode — stash immediately so data survives a crash/restart
    runState.status = 'awaiting_review';
    broadcastState();
    await stashRun(runState);
  } catch (error) {
    console.error('[Index] Domain analysis failed:', error);
    const message = error instanceof Error ? error.message : String(error);
    runState.proposal = {
      kind: 'review',
      country: null,
      phoneNumber: null,
      phoneNumbers: [],
      contactAccess: null,
      confidence: 0,
      reasoning: message,
    };
    runState.status = 'awaiting_review';
    appendEvent(
      candidate.domain,
      {
        id: `run-error-${candidate.domain}-${Date.now()}`,
        state: 'failed',
        type: 'error',
        message,
        createdAt: new Date().toISOString(),
      },
      runState.page ?? null,
    );
    await stashRun(runState);
  } finally {
    activeAbortControllers.delete(candidate.domain);
    if (isRunning && currentRuns.size < MAX_CONCURRENT) {
      void continueQueue();
    }
  }
};

const startCandidate = (candidate: DomainCandidate): void => {
  const runState = createRunState(candidate);
  setCurrentRun(candidate.domain, runState);
  void processCandidate(candidate, runState);
};

const continueQueue = async (): Promise<void> => {
  if (!isRunning) {
    return;
  }

  while (currentRuns.size < MAX_CONCURRENT) {
    const excluded = new Set([...skippedDomains, ...currentRuns.keys(), ...stashStore.getDomains()]);
    const candidate = store.getNextDomain(excluded);
    if (!candidate) {
      return;
    }

    startCandidate(candidate);
  }
};

app.get('/api/state', (_request, response) => {
  response.json(getState());
});

app.get('/api/current-page-diagnostics', async (_request, response) => {
  const focusedRun = focusedDomain ? currentRuns.get(focusedDomain) : currentRuns.values().next().value;

  // Active run path — use stored page summary + live HTML
  if (focusedRun?.page) {
    try {
      const browserSession = browserSessions.get(focusedRun.domain);
      const html = browserSession ? await browserSession.getHtml() : '';
      return response.json({
        domain: focusedRun.domain,
        url: focusedRun.page.url,
        title: focusedRun.page.title,
        structuredText: focusedRun.page.structuredText,
        actionableElements: focusedRun.page.actionableElements,
        html,
      });
    } catch (error) {
      console.error('[Index] Diagnostics (active) failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      return response.status(500).json({ error: message });
    }
  }

  // Preview session path — live extraction from stash preview tab
  if (previewSession) {
    try {
      const snapshot = await previewSession.snapshotPage();
      return response.json({ domain: '_preview', ...snapshot });
    } catch (error) {
      console.error('[Index] Diagnostics (preview) failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      return response.status(500).json({ error: message });
    }
  }

  return response.status(400).json({ error: 'No current page diagnostics are available.' });
});

app.post('/api/browser/navigate', async (request, response) => {
  const url = String(request.body.url ?? '');

  if (!url) {
    return response.status(400).json({ error: 'url is required' });
  }

  const focusedRun = focusedDomain ? currentRuns.get(focusedDomain) : currentRuns.values().next().value;
  const domain = focusedRun?.domain;
  const activeSession = domain ? browserSessions.get(domain) : undefined;

  if (activeSession) {
    try {
      await activeSession.navigateTo(url);
      return response.json({ ok: true, opened: 'current' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return response.status(500).json({ error: message });
    }
  }

  try {
    // No active run session — reuse or create a preview tab in the existing browser context
    if (previewSession) {
      await previewSession.navigateTo(url);
      await previewSession.focus();
    } else {
      const browserInst = await instance.ensureBrowser();
      const page = await browserInst.contexts()[0].newPage();
      await instance.positionBrowserWindow(page, instance.getDesiredWindowBounds());
      previewSession = new BrowserSession(page, '_preview');
      await previewSession.navigateTo(url);
    }

    return response.json({ ok: true, opened: 'preview' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return response.status(500).json({ error: message });
  }
});

app.post('/api/browser/focus/:domain', async (request, response) => {
  const domain = String(request.params.domain ?? '');
  const session = browserSessions.get(domain);

  if (session) {
    await session.focus();
  }

  if (currentRuns.has(domain)) {
    focusedDomain = domain;
    broadcastState();
  }

  return response.json({ ok: true });
});

app.get('/api/stream', (_request, response) => {
  response.setHeader('Content-Type', 'text/event-stream');
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Connection', 'keep-alive');
  response.flushHeaders();
  response.write(`data: ${JSON.stringify(getState())}\n\n`);
  streamClients.add(response);

  response.on('close', () => {
    streamClients.delete(response);
  });
});

app.post('/api/ai/start', async (request, response) => {
  if (request.body.runMode && ['manual', 'auto_accept', 'run_all'].includes(String(request.body.runMode))) {
    runMode = request.body.runMode as RunMode;
  }

  isRunning = true;
  broadcastState();
  void continueQueue();
  response.json(getState());
});

app.post('/api/ai/pause', (_request, response) => {
  isRunning = false;
  broadcastState();
  response.json(getState());
});

app.post('/api/ai/stop', (_request, response) => {
  isRunning = false;
  for (const controller of activeAbortControllers.values()) {
    controller.abort();
  }
  broadcastState();
  response.json(getState());
});

app.post('/api/ai/settings', (request, response) => {
  if (request.body.runMode && ['manual', 'auto_accept', 'run_all'].includes(String(request.body.runMode))) {
    runMode = request.body.runMode as RunMode;
  }

  broadcastState();
  response.json(getState());
});

app.post('/api/review/accept', async (_request, response) => {
  const firstRun = focusedDomain ? currentRuns.get(focusedDomain) : currentRuns.values().next().value;
  if (!firstRun || firstRun.status !== 'awaiting_review' || !firstRun.proposal) {
    return response.status(400).json({ error: 'No proposal to accept.' });
  }

  if (firstRun.proposal.kind === 'review') {
    skippedDomains.add(firstRun.domain);
  } else {
    firstRun.status = 'saving';
    broadcastState();
    saveProposal(firstRun.domain, firstRun.proposal);
  }

  stashStore.remove(firstRun.domain);
  await closeDomainBrowser(firstRun.domain);
  setCurrentRun(firstRun.domain, null);
  void continueQueue();
  return response.json(getState());
});

app.post('/api/review/override', async (request, response) => {
  const firstRun = focusedDomain ? currentRuns.get(focusedDomain) : currentRuns.values().next().value;
  if (!firstRun || firstRun.status !== 'awaiting_review') {
    return response.status(400).json({ error: 'No active review to override.' });
  }

  const verdict = String(request.body.verdict ?? '');
  const country = normalizeCountryCode(request.body.country ? String(request.body.country) : null);
  const reasoning = String(request.body.reasoning ?? 'Manual override from review UI.');

  const proposal: ClassificationProposal =
    verdict === 'escort'
      ? { kind: 'escort', country, phoneNumber: null, phoneNumbers: [], contactAccess: 'phone_visible', reasoning, confidence: 100 }
      : verdict === 'bad'
        ? { kind: 'bad', country: null, phoneNumber: null, phoneNumbers: [], contactAccess: null, reasoning, confidence: 100 }
        : { kind: 'review', country: null, phoneNumber: null, phoneNumbers: [], contactAccess: null, reasoning, confidence: 0 };

  if (proposal.kind === 'review') {
    skippedDomains.add(firstRun.domain);
  } else {
    firstRun.status = 'saving';
    broadcastState();
    saveProposal(firstRun.domain, proposal);
  }

  stashStore.remove(firstRun.domain);
  await closeDomainBrowser(firstRun.domain);
  setCurrentRun(firstRun.domain, null);
  void continueQueue();
  return response.json(getState());
});

app.post('/api/review/retry', (_request, response) => {
  const firstRun = focusedDomain ? currentRuns.get(focusedDomain) : currentRuns.values().next().value;
  if (!firstRun || firstRun.status !== 'awaiting_review') {
    return response.status(400).json({ error: 'No active review to retry.' });
  }

  const candidate: DomainCandidate = {
    domain: firstRun.domain,
    source: firstRun.source,
    siteNames: [...firstRun.siteNames],
  };

  setCurrentRun(firstRun.domain, null);
  startCandidate(candidate);
  return response.json(getState());
});

app.post('/api/review/skip', async (_request, response) => {
  const firstRun = focusedDomain ? currentRuns.get(focusedDomain) : currentRuns.values().next().value;
  if (!firstRun || firstRun.status !== 'awaiting_review') {
    return response.status(400).json({ error: 'No active review to skip.' });
  }

  store.requeueUnknown(firstRun.domain);
  stashStore.remove(firstRun.domain);
  setCurrentRun(firstRun.domain, null);
  void continueQueue();
  return response.json(getState());
});

// ---- Stash endpoints ----

app.get('/api/stash', (_request, response) => {
  response.json(stashStore.list());
});

app.get('/api/stash/:domain', (request, response) => {
  const domain = String(request.params.domain ?? '');
  const run = stashStore.get(domain);

  if (!run) {
    return response.status(404).json({ error: 'Stashed run not found.' });
  }

  return response.json(run);
});

app.post('/api/stash/:domain/accept', async (request, response) => {
  const domain = String(request.params.domain ?? '');
  const run = stashStore.get(domain);

  if (!run) {
    return response.status(404).json({ error: 'Stashed run not found.' });
  }

  if (run.proposal.kind !== 'review') {
    saveStashedProposal(domain, run.siteNames, run.proposal);
  } else {
    skippedDomains.add(domain);
  }

  stashStore.remove(domain);
  broadcastState();
  return response.json(getState());
});

app.post('/api/stash/:domain/override', async (request, response) => {
  const domain = String(request.params.domain ?? '');
  const run = stashStore.get(domain);

  if (!run) {
    return response.status(404).json({ error: 'Stashed run not found.' });
  }

  const verdict = String(request.body.verdict ?? '');
  const country = normalizeCountryCode(request.body.country ? String(request.body.country) : null);
  const reasoning = String(request.body.reasoning ?? 'Manual override from review UI.');

  const proposal: ClassificationProposal =
    verdict === 'escort'
      ? { kind: 'escort', country, phoneNumber: null, phoneNumbers: [], contactAccess: 'phone_visible', reasoning, confidence: 100 }
      : { kind: 'bad', country: null, phoneNumber: null, phoneNumbers: [], contactAccess: null, reasoning, confidence: 100 };

  saveStashedProposal(domain, run.siteNames, proposal);
  stashStore.remove(domain);
  broadcastState();
  return response.json(getState());
});

app.post('/api/stash/:domain/discard', (_request, response) => {
  const domain = String(_request.params.domain ?? '');

  if (!stashStore.get(domain)) {
    return response.status(404).json({ error: 'Stashed run not found.' });
  }

  stashStore.remove(domain);
  broadcastState();
  return response.json(getState());
});

app.post('/api/stash/:domain/retry', (request, response) => {
  const domain = String(request.params.domain ?? '');
  const run = stashStore.get(domain);

  if (!run) {
    return response.status(404).json({ error: 'Stashed run not found.' });
  }

  const candidate: DomainCandidate = {
    domain: run.domain,
    source: run.source,
    siteNames: [...run.siteNames],
  };

  stashStore.remove(domain);
  startCandidate(candidate);
  return response.json(getState());
});

// ---- Manual domain mapping endpoints ----

app.get('/api/domains', (_request, response) => {
  const nextDomain = store.getNextDomain(skippedDomains);
  if (!nextDomain) {
    return response.json({ domain: null, remaining: 0, done: true });
  }

  return response.json({
    domain: nextDomain.domain,
    siteNames: nextDomain.siteNames,
    source: nextDomain.source,
    remaining: store.getRemainingCount(skippedDomains),
    countries: phoneSignals.ALL_COUNTRY_CODES,
    suggestedCountry: store.getSuggestedCountry(nextDomain.domain),
    done: false,
  });
});

app.post('/api/map-bad', (request: Request, response: Response) => {
  const domain = String(request.body.domain ?? '');

  try {
    const remaining = store.mapBad(domain);
    return response.json({ success: true, remaining });
  } catch (error) {
    console.error('[Index] Map bad failed:', error);
    const message = error instanceof Error ? error.message : String(error);
    return response.status(400).json({ error: message });
  }
});

app.post('/api/map-escort', (request: Request, response: Response) => {
  const domain = String(request.body.domain ?? '');
  const country = String(request.body.country ?? '');

  try {
    const remaining = store.mapEscort(domain, country);
    return response.json({ success: true, remaining });
  } catch (error) {
    console.error('[Index] Map escort failed:', error);
    const message = error instanceof Error ? error.message : String(error);
    return response.status(400).json({ error: message });
  }
});

app.listen(config.port, () => {
  console.log(`Domain mapper server running on http://localhost:${config.port}`);
});
