#!/usr/bin/env node
// Chrome DevTools Protocol client for Orion on iPhone/iPad.
//
// Orion is a WebKit browser, but it does mark its WebViews as inspectable, and
// pymobiledevice3 exposes every inspectable WebView (tabs *and* the extension
// background page) as CDP targets over USB. That gives Orion roughly the same
// remote-control surface Yandex has over adb: list tabs, evaluate JS, reload,
// click, screenshot, stream console logs.
//
// The only phone-side requirement is the system Web Inspector switch:
//   Settings -> Safari -> Advanced -> Web Inspector
//
// Usage:
//   node orion-cdp.mjs status
//   node orion-cdp.mjs start | stop
//   node orion-cdp.mjs tabs
//   node orion-cdp.mjs eval <js-expression> [url-substring]
//   node orion-cdp.mjs bg-eval <js-expression>
//   node orion-cdp.mjs screenshot <out.png> [url-substring]
//   node orion-cdp.mjs reload-tab [url-substring]
//   node orion-cdp.mjs navigate <url> [url-substring]
//   node orion-cdp.mjs click <css-selector> [url-substring]
//   node orion-cdp.mjs console [seconds] [url-substring]
//
// Environment:
//   ORION_CDP_PORT   CDP port (default 9222).
//
// The script starts the CDP bridge itself when it is not already running and
// leaves it running in the background; `stop` shuts it down.

import fs from 'node:fs';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {ios} from './ios.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(SCRIPT_DIR, '..');
const STATE_DIR = path.join(SKILL_DIR, '.mobile', 'orion');
const DEFAULT_PORT = Number(process.env.ORION_CDP_PORT ?? 9222);

// Node 20 exposes WebSocket only behind a flag; re-exec once to enable it.
if (typeof globalThis.WebSocket === 'undefined') {
  const result = spawnSync(
    process.execPath,
    ['--experimental-websocket', fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    {stdio: 'inherit'},
  );

  process.exit(result.status ?? 1);
}

function log(message) {
  console.log(`[orion-cdp] ${message}`);
}

function pidFile(port) {
  return path.join(STATE_DIR, `cdp-${port}.pid`);
}

function logFile(port) {
  return path.join(STATE_DIR, `cdp-${port}.log`);
}

async function isServerUp(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/json/version`, {
      signal: AbortSignal.timeout(1_500),
    });

    return response.ok;
  } catch (error) {
    if (error instanceof Error && error.name !== 'TimeoutError') {
      return false;
    }

    return false;
  }
}

async function readTargets(port) {
  const response = await fetch(`http://127.0.0.1:${port}/json/list`, {
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new Error(`CDP returned HTTP ${response.status} for /json/list`);
  }

  return response.json();
}

// The bridge enumerates WebViews on the device lazily, so the first /json/list
// after startup can be empty for a few seconds.
async function waitForTargets(port, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  let targets = [];

  while (Date.now() < deadline) {
    targets = await readTargets(port);

    if (targets.length > 0) {
      return targets;
    }

    await sleep(400);
  }

  return targets;
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function ensureServer(port) {
  if (await isServerUp(port)) {
    await waitForTargets(port, 10_000);

    return {started: false, port};
  }

  if (ios.devices().length === 0) {
    throw new Error(
      'No iPhone/iPad over USB. Connect the phone, unlock it, and trust this computer '
      + '(or run "deploy.sh orion --lan" for a network install instead).',
    );
  }

  fs.mkdirSync(STATE_DIR, {recursive: true});
  fs.rmSync(logFile(port), {force: true});

  const logFd = fs.openSync(logFile(port), 'a');
  const child = spawn(
    ios.binary(),
    ['webinspector', 'cdp', '--port', String(port)],
    {detached: true, stdio: ['ignore', logFd, logFd]},
  );

  child.unref();
  fs.writeFileSync(pidFile(port), `${child.pid}\n`);

  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    if (await isServerUp(port)) {
      log(`CDP bridge started on port ${port} (pid ${child.pid})`);
      await waitForTargets(port, 10_000);

      return {started: true, port};
    }

    const logText = fs.existsSync(logFile(port))
      ? fs.readFileSync(logFile(port), 'utf8')
      : '';

    if (/web inspector is not enabled/i.test(logText)) {
      throw new Error(
        'Web Inspector is disabled on the phone. Enable it in '
        + 'Settings -> Safari -> Advanced -> Web Inspector, then retry.',
      );
    }

    if (child.exitCode !== null) {
      throw new Error(`CDP bridge exited (code ${child.exitCode}). See ${logFile(port)}`);
    }

    await sleep(250);
  }

  throw new Error(`CDP bridge did not start in time. See ${logFile(port)}`);
}

function stopServer(port) {
  const file = pidFile(port);

  if (!fs.existsSync(file)) {
    log(`No pid file for port ${port}; nothing to stop`);
    return false;
  }

  const pid = Number(fs.readFileSync(file, 'utf8').trim());

  try {
    process.kill(pid, 'SIGTERM');
    log(`Stopped CDP bridge (pid ${pid})`);
  } catch (error) {
    if (error.code !== 'ESRCH') {
      throw error;
    }

    log(`CDP bridge (pid ${pid}) was already gone`);
  }

  fs.rmSync(file, {force: true});

  return true;
}

class CdpSession {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.closing = false;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.id !== undefined && this.pending.has(message.id)) {
        const {resolve, reject} = this.pending.get(message.id);
        this.pending.delete(message.id);

        if (message.error) {
          reject(new Error(`${message.error.message ?? 'CDP error'} (${JSON.stringify(message.error)})`));
        } else {
          resolve(message.result ?? {});
        }

        return;
      }

      if (message.method) {
        for (const listener of this.listeners.get(message.method) ?? []) {
          listener(message.params ?? {});
        }
      }
    };

    socket.onclose = () => {
      if (!this.closing) {
        for (const {reject} of this.pending.values()) {
          reject(new Error('CDP socket closed'));
        }
      }

      this.pending.clear();
    };
  }

  static async connect(url, timeout = 10_000) {
    const socket = new WebSocket(url);

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timed out opening CDP socket ${url}`));
      }, timeout);

      socket.onopen = () => {
        clearTimeout(timer);
        resolve();
      };
      socket.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`Could not open CDP socket ${url}`));
      };
    });

    return new CdpSession(socket);
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) ?? [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }

  send(method, params = {}, timeout = 30_000) {
    const id = this.nextId++;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP command timed out: ${method}`));
      }, timeout);

      this.pending.set(id, {
        resolve: (result) => {
          clearTimeout(timer);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
      this.socket.send(JSON.stringify({id, method, params}));
    });
  }

  close() {
    this.closing = true;
    this.socket.close();
  }
}

function describeTarget(target) {
  return {
    id: target.id,
    title: target.title ?? '',
    url: target.url ?? '',
  };
}

function matchingTargets(targets, needle = '') {
  const pages = targets.filter((target) => target.type === 'page');

  if (needle) {
    return pages.filter(
      (target) => target.url.includes(needle) || (target.title ?? '').includes(needle),
    );
  }

  const loaded = pages.filter((target) => /^https?:\/\//.test(target.url));

  if (loaded.length > 0) {
    return loaded;
  }

  const named = pages.filter((target) => !target.url.startsWith('about:'));

  if (named.length > 0) {
    return named;
  }

  return pages;
}

// Stale targets can linger in the list after Orion recreates a WebView, so try
// each match until one actually answers.
//
// Only one inspector session can exist at a time. Switching between WebViews
// (page <-> extension background page) makes iOS re-attach on the device, which
// takes about six seconds. Retrying aggressively makes it worse, so each
// candidate gets exactly one generous attempt.
// Turns a discovered target into an enabled CDP session. Only one inspector
// session can exist at a time.
async function openSession(target, enableTimeout = 7_000) {
  const session = await CdpSession.connect(target.webSocketDebuggerUrl, 5_000);

  try {
    await session.send('Runtime.enable', {}, enableTimeout);
    await session.send('Page.enable', {}, enableTimeout).catch(() => undefined);
  } catch (error) {
    session.close();
    throw error;
  }

  return session;
}

async function attach(port, needle, timeout = 45_000) {
  const deadline = Date.now() + timeout;
  let lastError = null;

  while (Date.now() < deadline) {
    const targets = await readTargets(port);
    const candidates = matchingTargets(targets, needle);

    if (candidates.length === 0) {
      lastError = new Error(
        `No target matching "${needle}". Open targets:\n${targets
          .filter((target) => target.type === 'page')
          .map((target) => `  ${target.url}`)
          .join('\n')}`,
      );
      await sleep(500);
      continue;
    }

    for (const target of candidates) {
      const started = Date.now();
      let session = null;
      const notice = setTimeout(() => {
        process.stderr.write(
          `[orion-cdp] attaching to ${target.url} (slow WebView switch, up to 20s)\n`,
        );
      }, 1_200);

      try {
        session = await openSession(target);
        clearTimeout(notice);

        if (Date.now() - started > 1_200) {
          process.stderr.write(`[orion-cdp] attached in ${Date.now() - started}ms\n`);
        }

        return {session, target};
      } catch (error) {
        clearTimeout(notice);
        lastError = error;

        if (session) {
          await session.close();
        }
      }
    }

    await sleep(500);
  }

  throw lastError ?? new Error('No inspectable WebView. Open a tab in Orion and retry.');
}

async function evaluate(session, expression) {
  const response = await session.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
    includeCommandLineAPI: true,
  });

  if (response.wasThrown) {
    const detail = response.result?.description ?? JSON.stringify(response.result?.value ?? null);
    throw new Error(`Evaluation threw: ${detail}`);
  }

  return response.result?.value;
}

async function waitForReady(session, timeout = 45_000) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    try {
      const state = await evaluate(session, 'document.readyState');

      if (state === 'complete') {
        return true;
      }
    } catch (error) {
      // The execution context is destroyed while the document navigates.
      if (!/context|destroyed|not found|closed/i.test(error.message)) {
        throw error;
      }
    }

    await sleep(250);
  }

  return false;
}

function printResult(value) {
  if (typeof value === 'string') {
    console.log(value);
    return;
  }

  console.log(JSON.stringify(value, null, 2));
}

async function commandTabs(port) {
  const targets = await waitForTargets(port, 5_000);
  console.log(JSON.stringify(targets.filter((target) => target.type === 'page').map(describeTarget), null, 2));
}

async function commandEval(port, expression, needle) {
  if (!expression) {
    throw new Error('Missing JS expression');
  }

  const {session} = await attach(port, needle);

  try {
    printResult(await evaluate(session, expression));
  } finally {
    await session.close();
  }
}

async function commandScreenshot(port, output, needle) {
  if (!output) {
    throw new Error('Missing output path');
  }

  const {session, target} = await attach(port, needle);

  try {
    const screenshot = await session.send('Page.captureScreenshot', {format: 'png'});

    if (!screenshot.data) {
      throw new Error('Page.captureScreenshot returned no data');
    }

    fs.writeFileSync(output, Buffer.from(screenshot.data, 'base64'));
    console.log(JSON.stringify({ok: true, url: target.url, output}, null, 2));
  } finally {
    await session.close();
  }
}

async function commandReload(port, needle) {
  const {session, target} = await attach(port, needle);

  try {
    await session.send('Page.reload', {ignoreCache: true});
    const ready = await waitForReady(session);
    const state = ready
      ? await evaluate(session, 'JSON.stringify({url: location.href, title: document.title})')
      : null;

    console.log(JSON.stringify({ok: ready, target: target.url, page: state ? JSON.parse(state) : null}, null, 2));
  } finally {
    await session.close();
  }
}

async function commandNavigate(port, url, needle) {
  if (!url) {
    throw new Error('Missing URL');
  }

  const {session, target} = await attach(port, needle);

  try {
    const result = await session.send('Page.navigate', {url});
    const ready = await waitForReady(session);
    const state = ready
      ? await evaluate(session, 'JSON.stringify({url: location.href, title: document.title})')
      : null;

    console.log(JSON.stringify({
      ok: ready,
      errorText: result.errorText ?? null,
      target: target.url,
      page: state ? JSON.parse(state) : null,
    }, null, 2));
  } finally {
    await session.close();
  }
}

async function commandClick(port, selector, needle) {
  if (!selector) {
    throw new Error('Missing CSS selector');
  }

  const {session} = await attach(port, needle);

  try {
    const rect = await evaluate(session, `(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) { return null; }
      element.scrollIntoView({block: 'center', inline: 'center'});
      const box = element.getBoundingClientRect();
      return {x: box.x + box.width / 2, y: box.y + box.height / 2};
    })()`);

    if (!rect) {
      throw new Error(`No element matches "${selector}"`);
    }

    // A real pointer event, so handlers that check isTrusted or pointer state fire.
    for (const type of ['mousePressed', 'mouseReleased']) {
      await session.send('Input.dispatchMouseEvent', {
        type,
        x: rect.x,
        y: rect.y,
        button: 'left',
        clickCount: 1,
      });
    }

    await sleep(150);
    const state = await evaluate(session, 'JSON.stringify({url: location.href, title: document.title})');

    console.log(JSON.stringify({ok: true, point: rect, page: JSON.parse(state)}, null, 2));
  } finally {
    await session.close();
  }
}

function formatConsoleArgument(argument) {
  if (argument.value !== undefined) {
    return typeof argument.value === 'string' ? argument.value : JSON.stringify(argument.value);
  }

  return argument.description ?? argument.type ?? '';
}

async function commandConsole(port, seconds, needle) {
  const duration = Number(seconds ?? 10);

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Invalid duration: ${seconds}`);
  }

  const {session} = await attach(port, needle);
  const lines = [];

  session.on('Runtime.consoleAPICalled', (params) => {
    const text = (params.args ?? []).map(formatConsoleArgument).join(' ');
    console.log(`${params.type}: ${text}`);
    lines.push(`${params.type}: ${text}`);
  });

  session.on('Runtime.exceptionThrown', (params) => {
    const text = params.exceptionDetails?.exception?.description
      ?? params.exceptionDetails?.text
      ?? 'unknown exception';
    console.log(`exception: ${text}`);
  });

  await session.send('Log.enable').catch(() => undefined);

  session.on('Log.entryAdded', (params) => {
    const entry = params.entry ?? {};
    console.log(`${entry.level ?? 'log'}: ${entry.text ?? ''}`);
  });

  log(`Streaming console for ${duration}s (Ctrl+C to stop)`);
  await sleep(duration * 1_000);
  await session.close();

  return lines;
}

async function commandReloadExtension(port, expectedVersion) {
  const {session, target} = await attach(port, 'chrome-extension://');
  const before = await evaluate(session, 'chrome.runtime.getManifest().version');

  log(`Extension ${target.url} is on version ${before}`);

  try {
    await session.send('Runtime.evaluate', {
      expression: 'chrome.runtime.reload(); 1',
      returnByValue: true,
    }, 800);
  } catch (error) {
    // The inspected page is destroyed while reloading; no reply is expected.
    if (!/timeout|timed out|closed|context/i.test(error.message)) {
      throw error;
    }
  }

  session.close();

  const deadline = Date.now() + 60_000;
  let after = null;
  let lastError = null;

  while (Date.now() < deadline) {
    await sleep(500);

    try {
      const targets = await readTargets(port);
      const extensionTargets = targets.filter((item) => item.url.startsWith('chrome-extension://'));
      const fresh = extensionTargets.find((item) => item.id !== target.id);
      const oldStillListed = targets.some((item) => item.id === target.id);

      // Wait for the replaced WebView to disappear before attaching, otherwise
      // the device is still tearing down the previous inspector session.
      if (!fresh || oldStillListed) {
        continue;
      }

      const next = await openSession(fresh, 10_000);

      try {
        after = await evaluate(next, 'chrome.runtime.getManifest().version');
      } finally {
        next.close();
      }

      break;
    } catch (error) {
      lastError = error;
    }
  }

  const ok = after !== null && (!expectedVersion || after === expectedVersion);

  printResult({ok, before, after, expected: expectedVersion ?? null});

  if (!ok) {
    if (lastError) {
      process.stderr.write(`[orion-cdp] last error: ${lastError.message}\n`);
    }

    process.exitCode = 1;
  }

  return ok;
}

function commandDebugLog(lines) {
  const count = Number(lines ?? 80);

  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`Invalid line count: ${lines}`);
  }

  const text = ios.readDocumentsFile('debuglog.txt', count);

  console.log(text);
}

async function status(port) {
  log('Device');

  if (!ios.available()) {
    console.log(`  ${ios.installHint}`);
  } else {
    const devices = ios.devices();

    if (devices.length === 0) {
      console.log('  No iPhone/iPad over USB (LAN install still works).');
    } else {
      for (const device of devices) {
        console.log(`  ${device.DeviceName ?? device.DeviceClass} ${device.ProductType} iOS ${device.ProductVersion} (${device.Identifier})`);
      }
    }
  }

  log('CDP bridge');
  const up = await isServerUp(port);

  if (up) {
    const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
    console.log(`  running on http://127.0.0.1:${port} (${version.Browser ?? 'unknown'})`);
  } else {
    console.log(`  not running (start it with "node orion-cdp.mjs start" or implicitly via any command)`);
  }

  if (!up) {
    return;
  }

  log('Inspectable WebViews');
  const targets = await waitForTargets(port, 5_000);

  for (const target of targets.filter((item) => item.type === 'page')) {
    console.log(`  ${target.id}  ${target.title || '(no title)'}  ${target.url}`);
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === 'status') {
    await status(DEFAULT_PORT);
    return;
  }

  if (command === 'start') {
    await ensureServer(DEFAULT_PORT);
    return;
  }

  if (command === 'stop') {
    stopServer(DEFAULT_PORT);
    return;
  }

  if (command === 'debug-log') {
    commandDebugLog(args[0]);
    return;
  }

  await ensureServer(DEFAULT_PORT);

  if (command === 'reload-extension') {
    const expectIndex = args.indexOf('--expect');
    const expected = expectIndex >= 0 ? args[expectIndex + 1] : undefined;

    await commandReloadExtension(DEFAULT_PORT, expected);
    return;
  }

  if (command === 'tabs' || command === 'targets') {
    await commandTabs(DEFAULT_PORT);
    return;
  }

  if (command === 'eval') {
    await commandEval(DEFAULT_PORT, args[0], args[1]);
    return;
  }

  if (command === 'bg-eval') {
    await commandEval(DEFAULT_PORT, args[0], 'chrome-extension://');
    return;
  }

  if (command === 'screenshot') {
    await commandScreenshot(DEFAULT_PORT, args[0], args[1]);
    return;
  }

  if (command === 'reload-tab') {
    await commandReload(DEFAULT_PORT, args[0]);
    return;
  }

  if (command === 'navigate') {
    await commandNavigate(DEFAULT_PORT, args[0], args[1]);
    return;
  }

  if (command === 'click') {
    await commandClick(DEFAULT_PORT, args[0], args[1]);
    return;
  }

  if (command === 'console') {
    await commandConsole(DEFAULT_PORT, args[0], args[1]);
    return;
  }

  throw new Error(
    'Usage: orion-cdp.mjs <status|start|stop|tabs|eval|bg-eval|screenshot|reload-tab|reload-extension|navigate|click|console|debug-log> [args]',
  );
}

main().catch((error) => {
  console.error(`[orion-cdp] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
