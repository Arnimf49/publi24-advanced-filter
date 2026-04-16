import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { mapperClient } from './mapperClient';
import { diagnosticsPanel } from './components/DiagnosticsPanel';
import { eventLogPanel } from './components/EventLogPanel';
import { reviewPanel } from './components/ReviewPanel';
import { stashPanel } from './components/StashPanel';
import type { ActiveRunSummary, CurrentRunState, DiagnosticsPayload, PanelMode, PublicState, RunMode, StashedRun } from './types';

const { DiagnosticsPanel } = diagnosticsPanel;
const { EventLogPanel } = eventLogPanel;
const { ReviewPanel } = reviewPanel;
const { StashPanel } = stashPanel;

const EMPTY_STATE: PublicState = {
  running: false,
  pausing: false,
  runMode: 'manual',
  done: false,
  current: null,
  activeRuns: [],
  remaining: 0,
  total: 0,
  stashedCount: 0,
  countries: [],
};

const panelModeForState = (state: PublicState): PanelMode => {
  if (state.current?.status === 'awaiting_review') {
    return 'review';
  }

  if (state.current?.page) {
    return 'diagnostics';
  }

  return 'log';
};

const RUN_MODE_LABELS: Record<RunMode, string> = {
  manual: 'Manual',
  auto_accept: 'Auto',
  run_all: 'Run all',
};

const App = (): JSX.Element => {
  const [state, setState] = useState<PublicState>(EMPTY_STATE);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copyingDiagnostics, setCopyingDiagnostics] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsPayload | null>(null);
  const [diagnosticsError, setDiagnosticsError] = useState<string | null>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('log');
  const [manualVerdict, setManualVerdict] = useState<'escort' | 'bad' | ''>('');
  const [manualCountry, setManualCountry] = useState('general');
  const [stashOpen, setStashOpen] = useState(false);
  // When a stashed run is opened for inspection it takes over the workspace
  const [stashedRunView, setStashedRunView] = useState<StashedRun | null>(null);
  const [stashBusy, setStashBusy] = useState(false);
  const [stashOverrideVerdict, setStashOverrideVerdict] = useState<'escort' | 'bad' | ''>('');
  const [stashOverrideCountry, setStashOverrideCountry] = useState('general');

  const current = state.current;
  const proposal = current?.proposal ?? null;
  const reviewAvailable = current?.status === 'awaiting_review';
  const diagnosticsAvailable = Boolean(current?.page);
  const isStashView = stashedRunView !== null;

  const progressLabel = useMemo(() => {
    if (state.total === 0) {
      return 'No domains loaded';
    }

    const completed = state.total - state.remaining;
    return `${completed}/${state.total}`;
  }, [state.remaining, state.total]);

  const loadState = useCallback(async (): Promise<void> => {
    try {
      const nextState = await mapperClient.fetchJson<PublicState>('/api/state');
      setState(nextState);
      setPanelMode(panelModeForState(nextState));
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    }
  }, []);

  const loadDiagnostics = async (): Promise<DiagnosticsPayload | null> => {
    try {
      setDiagnosticsLoading(true);
      const nextDiagnostics = await mapperClient.fetchJson<DiagnosticsPayload>('/api/current-page-diagnostics');
      setDiagnostics(nextDiagnostics);
      setDiagnosticsError(null);
      return nextDiagnostics;
    } catch (requestError) {
      setDiagnostics(null);
      setDiagnosticsError(requestError instanceof Error ? requestError.message : String(requestError));
      return null;
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  useEffect(() => {
    void loadState();
  }, [loadState]);

  useEffect(() => {
    const eventSource = new EventSource('/api/stream');

    eventSource.onmessage = (event) => {
      try {
        const nextState = JSON.parse(event.data) as PublicState;
        setState(nextState);
        setPanelMode((currentMode) => {
          // Don't interrupt stash view mode
          if (currentMode === 'stash-actions') {
            return currentMode;
          }

          if (nextState.current?.status === 'awaiting_review') {
            return 'review';
          }

          if (!nextState.current) {
            return 'log';
          }

          if (currentMode === 'review') {
            return nextState.current.page ? 'diagnostics' : 'log';
          }

          if (currentMode === 'diagnostics' && !nextState.current.page) {
            return 'log';
          }

          return currentMode;
        });
      } catch (parseError) {
        console.error(parseError);
      }
    };

    eventSource.onerror = () => {
      setError('Lost connection to the mapper server.');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (!proposal) {
      return;
    }

    setManualVerdict('bad');
    setManualCountry(proposal.country ?? current?.suggestedCountry ?? 'general');
  }, [current?.suggestedCountry, proposal]);

  useEffect(() => {
    if (!reviewAvailable) {
      setManualVerdict('');
    }
  }, [reviewAvailable]);

  useEffect(() => {
    setDiagnostics(null);
    setDiagnosticsError(null);
  }, [current?.domain, current?.page?.url, stashedRunView?.domain]);

  useEffect(() => {
    const canLoad = diagnosticsAvailable || isStashView;
    if (panelMode === 'diagnostics' && canLoad && !diagnostics && !diagnosticsLoading) {
      void loadDiagnostics();
    }
  }, [diagnostics, diagnosticsAvailable, diagnosticsLoading, isStashView, panelMode]);

  const handleAction = async (url: string, body?: unknown): Promise<void> => {
    try {
      setBusy(true);
      const nextState = await mapperClient.fetchJson<PublicState>(url, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      });
      setState(nextState);
      setPanelMode(panelModeForState(nextState));
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setBusy(false);
    }
  };

  const handleFocusRun = async (summary: ActiveRunSummary): Promise<void> => {
    await mapperClient.focusDomain(summary.domain).catch(() => null);
    await loadState();
  };

  const handleOpenStash = async (domain: string): Promise<void> => {
    try {
      setStashBusy(true);
      const run = await mapperClient.fetchStashedRun(domain);
      setStashedRunView(run);
      setStashOpen(false);
      setStashOverrideVerdict('');
      setStashOverrideCountry(run.proposal.country ?? run.suggestedCountry ?? 'general');
      setPanelMode('stash-actions');
      setError(null);
      // Navigate browser to the original source URL for this domain
      const navigateUrl = run.source ?? `https://${run.domain}`;
      await mapperClient.navigateTo(navigateUrl).catch(() => null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setStashBusy(false);
    }
  };

  const handleCloseStashView = (): void => {
    setStashedRunView(null);
    setPanelMode('log');
    setStashOpen(true);
  };

  const handleStashRetry = async (domain: string): Promise<void> => {
    try {
      setStashBusy(true);
      const nextState = await mapperClient.stashRetry(domain);
      setState(nextState);
      setStashedRunView(null);
      // Focus the retried domain so the workspace shows its active run
      await mapperClient.focusDomain(domain).catch(() => null);
      setPanelMode('log');
      setStashOpen(false);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setStashBusy(false);
    }
  };

  const handleStashAction = async (action: () => Promise<PublicState>): Promise<void> => {
    try {
      setStashBusy(true);
      const nextState = await action();
      setState(nextState);
      setStashedRunView(null);
      setPanelMode(panelModeForState(nextState));
      setError(null);

      // Auto-open the next stashed run if any remain
      if (nextState.stashedCount > 0) {
        const list = await mapperClient.fetchStashList();
        if (list.length > 0) {
          await handleOpenStash(list[0].domain);
          return;
        }
      }

      setStashOpen(nextState.stashedCount > 0);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setStashBusy(false);
    }
  };

  const handleCopyDiagnostics = async (): Promise<void> => {
    try {
      setCopyingDiagnostics(true);
      const diagnosticsPayload = diagnostics ?? await loadDiagnostics();
      if (!diagnosticsPayload) {
        return;
      }

      const payload = [
        `Domain: ${diagnosticsPayload.domain}`,
        `URL: ${diagnosticsPayload.url}`,
        '',
        '=== Event log ===',
        ...(current?.events.map((event) => `[${event.createdAt}] ${event.state.toUpperCase()} ${event.type.toUpperCase()} ${event.message}`) ?? []),
        '',
        '=== Actionable elements ===',
        JSON.stringify(diagnosticsPayload.actionableElements, null, 2),
        '',
        '=== Structured text ===',
        diagnosticsPayload.structuredText,
        '',
        '=== HTML ===',
        diagnosticsPayload.html,
      ].join('\n');

      await navigator.clipboard.writeText(payload);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setCopyingDiagnostics(false);
    }
  };

  // Determine what to show in the workspace
  const workspaceDomain = isStashView ? stashedRunView.domain : current?.domain;
  const workspaceSubtitle = isStashView
    ? `${stashedRunView.siteNames.join(', ') || 'No site names'} · stashed`
    : current
      ? `${current.siteNames.join(', ') || 'No site names'} · ${current.source ?? `https://${current.domain}`}`
      : 'Waiting for the next domain.';

  return (
    <Box className="container">
      <Paper className="topBar" elevation={3}>
        <Box>
          <Typography variant="h5">AI Domain Mapper</Typography>
          <Typography variant="body2" color="text.secondary">
            Progress {progressLabel} · Remaining {state.remaining}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Badge badgeContent={state.stashedCount} color="warning" max={99}>
            <Button
              variant={stashOpen ? 'contained' : 'outlined'}
              size="small"
              disabled={stashBusy}
              onClick={() => setStashOpen((v) => !v)}
            >
              Stash
            </Button>
          </Badge>

          <ToggleButtonGroup
            size="small"
            exclusive
            value={state.runMode}
            onChange={(_e, value: RunMode | null) => {
              if (value) {
                void handleAction('/api/ai/settings', { runMode: value });
              }
            }}
            disabled={busy}
          >
            {(Object.keys(RUN_MODE_LABELS) as RunMode[]).map((mode) => (
              <ToggleButton key={mode} value={mode} sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}>
                {RUN_MODE_LABELS[mode]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Button
            variant="contained"
            color={state.pausing ? 'error' : 'primary'}
            onClick={() => {
              if (state.pausing) {
                void handleAction('/api/ai/stop');
              } else if (state.running) {
                void handleAction('/api/ai/pause');
              } else {
                void handleAction('/api/ai/start', { runMode: state.runMode });
              }
            }}
            disabled={busy}
          >
            {state.pausing ? 'Stop' : state.running ? 'Pause' : 'Start'}
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mx: 1, mt: 0 }}>
          {error}
        </Alert>
      )}

      <Box className="mainArea">
        {stashOpen && (
          <Paper className="stashSidebar" elevation={3}>
            <StashPanel
              stashedCount={state.stashedCount}
              onOpen={(domain) => { void handleOpenStash(domain); }}
            />
          </Paper>
        )}

        <Box className="workspaceArea">
          {state.done && !current && !isStashView && (
            <Paper className="doneCard" elevation={3}>
              <Typography variant="h4">All done</Typography>
              <Typography variant="body1" color="text.secondary">
                No remaining domains were found.
              </Typography>
            </Paper>
          )}

          {state.activeRuns.length > 1 && (
            <Paper className="runPicker" elevation={2}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1.5, py: 0.75 }}>
                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                  Active:
                </Typography>
                {state.activeRuns.map((run) => (
                  <Chip
                    key={run.domain}
                    label={run.domain}
                    size="small"
                    variant={run.domain === current?.domain ? 'filled' : 'outlined'}
                    color={run.status === 'awaiting_review' ? 'warning' : 'default'}
                    onClick={() => { void handleFocusRun(run); }}
                    sx={{ cursor: 'pointer', maxWidth: 160 }}
                  />
                ))}
              </Stack>
            </Paper>
          )}

          <Paper className="workspace" elevation={3}>
            <Box className="workspaceHeader">
              <Box className="workspaceTitle">
                <Stack direction="row" spacing={1} alignItems="center">
                  {isStashView && (
                    <Button size="small" variant="text" onClick={handleCloseStashView} sx={{ minWidth: 0, px: 0.5, mr: 0.5 }}>
                      ←
                    </Button>
                  )}
                  <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                    <Typography variant="h6" noWrap>
                      {workspaceDomain ?? 'No active domain'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {workspaceSubtitle}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <Box className="workspaceHeaderTabs">
                <Tabs
                  value={panelMode}
                  onChange={(_event, value: PanelMode) => setPanelMode(value)}
                >
                  <Tab label="Event log" value="log" />
                  {isStashView && <Tab label="Diagnostics" value="diagnostics" />}
                  {isStashView && <Tab label="Review" value="stash-actions" />}
                  {!isStashView && reviewAvailable && <Tab label="Review" value="review" />}
                  {!isStashView && diagnosticsAvailable && <Tab label="Diagnostics" value="diagnostics" />}
                </Tabs>
              </Box>
            </Box>

            <Divider />

            <Box className="panelBody">
              {panelMode === 'log' && !isStashView && <EventLogPanel current={current} />}

              {panelMode === 'log' && isStashView && stashedRunView && (
                <EventLogPanel current={{ ...stashedRunView, status: 'awaiting_review' }} />
              )}

              {panelMode === 'stash-actions' && isStashView && stashedRunView && (
                <ReviewPanel
                  busy={stashBusy}
                  countries={state.countries}
                  current={stashedRunView as unknown as CurrentRunState}
                  manualCountry={stashOverrideCountry}
                  manualVerdict={stashOverrideVerdict}
                  onAccept={() => {
                    void handleStashAction(() => mapperClient.stashAccept(stashedRunView.domain));
                  }}
                  onRetry={() => {
                    void handleStashRetry(stashedRunView.domain);
                  }}
                  onSkip={() => {
                    void handleStashAction(() => mapperClient.stashDiscard(stashedRunView.domain));
                  }}
                  skipLabel="Discard"
                  onManualCountryChange={setStashOverrideCountry}
                  onManualVerdictChange={setStashOverrideVerdict}
                  onOverrideSave={() => {
                    void handleStashAction(() =>
                      mapperClient.stashOverride(stashedRunView.domain, {
                        verdict: stashOverrideVerdict,
                        country: stashOverrideVerdict === 'escort' ? stashOverrideCountry : null,
                      }),
                    );
                  }}
                />
              )}

              {panelMode === 'review' && !isStashView && reviewAvailable && current && (
                <ReviewPanel
                  busy={busy}
                  countries={state.countries}
                  current={current}
                  manualCountry={manualCountry}
                  manualVerdict={manualVerdict}
                  onAccept={() => {
                    void handleAction('/api/review/accept');
                  }}
                  onRetry={() => {
                    void handleAction('/api/review/retry');
                  }}
                  onSkip={() => {
                    void handleAction('/api/review/skip');
                  }}
                  onManualCountryChange={setManualCountry}
                  onManualVerdictChange={setManualVerdict}
                  onOverrideSave={() => {
                    void handleAction('/api/review/override', {
                      verdict: manualVerdict,
                      country: manualVerdict === 'escort' ? manualCountry : null,
                    });
                  }}
                />
              )}

              {panelMode === 'diagnostics' && !isStashView && diagnosticsAvailable && current && (
                <DiagnosticsPanel
                  copyInProgress={copyingDiagnostics}
                  current={current}
                  diagnostics={diagnostics}
                  diagnosticsError={diagnosticsError}
                  diagnosticsLoading={diagnosticsLoading}
                  onCopy={() => {
                    void handleCopyDiagnostics();
                  }}
                />
              )}

              {panelMode === 'diagnostics' && isStashView && stashedRunView && (
                <DiagnosticsPanel
                  copyInProgress={copyingDiagnostics}
                  current={{ ...stashedRunView, status: 'awaiting_review' }}
                  diagnostics={diagnostics}
                  diagnosticsError={diagnosticsError}
                  diagnosticsLoading={diagnosticsLoading}
                  onCopy={() => {
                    void handleCopyDiagnostics();
                  }}
                />
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export const app = {
  App,
};
