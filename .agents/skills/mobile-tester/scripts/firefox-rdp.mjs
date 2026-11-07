#!/usr/bin/env node
// Minimal Firefox Remote Debugging Protocol (RDP) client for Firefox for Android.
// It talks to the same debugger socket used by `web-ext --target firefox-android`.
//
// Usage:
//   node firefox-rdp.mjs <port> ping
//   node firefox-rdp.mjs <port> tabs
//   node firefox-rdp.mjs <port> addons
//   node firefox-rdp.mjs <port> eval <js-expression> [tab-url-substring]
//   node firefox-rdp.mjs <port> navigate <url> [tab-url-substring]
//   node firefox-rdp.mjs <port> install <on-device-path-to-xpi> [open-devtools]
//   node firefox-rdp.mjs <port> reload <addon-id-or-name>
//
// `eval` prints the evaluated value. Use JSON.stringify() in the expression
// when the result should be a complete JSON value instead of a remote object.

import net from 'node:net';

function encodePacket(obj) {
  const json = Buffer.from(JSON.stringify(obj), 'utf8');
  return Buffer.concat([Buffer.from(`${json.length}:`, 'ascii'), json]);
}

function connect(port) {
  return new Promise((resolve, reject) => {
    const socket = net.connect(port, '127.0.0.1');
    const pending = new Map();
    const eventWaiters = new Set();
    let buffer = Buffer.alloc(0);

    const failAll = (error) => {
      for (const {reject: rejectPending} of pending.values()) {
        rejectPending(error);
      }
      pending.clear();
    };

    socket.on('connect', () => resolve({request, waitForEvent, close}));
    socket.on('error', (error) => {
      failAll(error);
      reject(error);
    });
    socket.on('close', () => failAll(new Error('RDP connection closed')));

    function request(data) {
      return new Promise((resolveRequest, rejectRequest) => {
        pending.set(data.to, {resolve: resolveRequest, reject: rejectRequest});
        socket.write(encodePacket(data));
      });
    }

    function waitForEvent(predicate, timeoutMs = 10_000) {
      return new Promise((resolveEvent, rejectEvent) => {
        const timer = setTimeout(() => {
          eventWaiters.delete(waiter);
          rejectEvent(new Error('Timed out waiting for RDP event'));
        }, timeoutMs);
        const waiter = {
          predicate,
          resolve: (packet) => {
            clearTimeout(timer);
            eventWaiters.delete(waiter);
            resolveEvent(packet);
          },
        };
        eventWaiters.add(waiter);
      });
    }

    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      while (true) {
        const colon = buffer.indexOf(0x3a);

        if (colon < 0) {
          break;
        }

        const length = Number.parseInt(buffer.subarray(0, colon).toString('ascii'), 10);

        if (Number.isNaN(length) || buffer.length < colon + 1 + length) {
          break;
        }

        const body = buffer.subarray(colon + 1, colon + 1 + length);
        buffer = buffer.subarray(colon + 1 + length);

        const packet = JSON.parse(body.toString('utf8'));

        // Greeting and unsolicited events have a `type` or `applicationType`.
        if (packet.type || packet.applicationType) {
          for (const waiter of [...eventWaiters]) {
            if (waiter.predicate(packet)) {
              waiter.resolve(packet);
            }
          }
          continue;
        }

        const waiter = pending.get(packet.from);

        if (waiter) {
          pending.delete(packet.from);
          waiter.resolve(packet);
        }
      }
    });

    function close() {
      socket.end();
    }
  });
}

async function getRoot(request) {
  return request({to: 'root', type: 'getRoot'});
}

async function getTabs(request) {
  const {tabs} = await request({to: 'root', type: 'listTabs'});
  return tabs;
}

async function getConsoleActor(request, tab) {
  const target = await request({to: tab.actor, type: 'getTarget'});
  const form = target.form ?? target.frame;

  if (!form?.consoleActor) {
    throw new Error(`Could not find a console actor for tab ${tab.url}`);
  }

  return form.consoleActor;
}

async function evaluate(request, waitForEvent, tab, expression) {
  const consoleActor = await getConsoleActor(request, tab);

  // Register the listener before sending: the result event can arrive in the
  // same TCP chunk immediately after the acknowledgement, before the request
  // promise continuation gets a chance to run.
  const resultPromise = waitForEvent((candidate) => candidate.type === 'evaluationResult');
  const {resultID} = await request({
    to: consoleActor,
    type: 'evaluateJSAsync',
    text: expression,
  });

  if (!resultID) {
    throw new Error('evaluateJSAsync did not return a resultID');
  }

  const packet = await resultPromise;

  if (packet.resultID !== resultID) {
    throw new Error(`Unexpected evaluationResult for ${packet.resultID}`);
  }

  if (packet.hasException) {
    const message = packet.exception?.preview?.items?.find((item) => item.name === 'message')?.value
      ?? packet.exceptionPreview?.items?.find((item) => item.name === 'message')?.value
      ?? 'Evaluation threw an exception';
    throw new Error(message);
  }

  return packet.result;
}

async function main() {
  const [portArg, command, ...args] = process.argv.slice(2);
  const port = Number(portArg);

  if (!port || !command) {
    throw new Error('Usage: firefox-rdp.mjs <port> <ping|tabs|addons|eval|install|reload> [args]');
  }

  const {request, waitForEvent, close} = await connect(port);

  try {
    if (command === 'ping') {
      const root = await getRoot(request);
      console.log(JSON.stringify({ok: true, addonsActor: root.addonsActor}, null, 2));
      return;
    }

    if (command === 'tabs') {
      const tabs = await getTabs(request);
      console.log(JSON.stringify(tabs.map((tab) => ({
        actor: tab.actor,
        title: tab.title,
        url: tab.url,
        selected: tab.selected,
      })), null, 2));
      return;
    }

    if (command === 'addons') {
      const {addons} = await request({to: 'root', type: 'listAddons'});
      console.log(JSON.stringify(addons.map((addon) => ({
        id: addon.id,
        name: addon.name,
        actor: addon.actor,
      })), null, 2));
      return;
    }

    if (command === 'eval') {
      const [expression, urlNeedle = ''] = args;

      if (!expression) {
        throw new Error('Missing JS expression');
      }

      const tabs = await getTabs(request);
      const tab = tabs.find((candidate) => candidate.url.includes(urlNeedle)) ?? tabs[0];

      if (!tab) {
        throw new Error('No tabs available');
      }

      console.log(await evaluate(request, waitForEvent, tab, expression));
      return;
    }

    if (command === 'navigate') {
      const [url, urlNeedle = ''] = args;

      if (!url) {
        throw new Error('Missing URL');
      }

      const tabs = await getTabs(request);
      const tab = tabs.find((candidate) => candidate.url.includes(urlNeedle)) ?? tabs[0];

      if (!tab) {
        throw new Error('No tabs available');
      }

      const result = await request({to: tab.actor, type: 'navigateTo', url});
      console.log(JSON.stringify({ok: true, url: tab.url, result}, null, 2));
      return;
    }

    if (command === 'reload-tab') {
      const [urlNeedle = ''] = args;
      const tabs = await getTabs(request);
      const tab = tabs.find((candidate) => candidate.url.includes(urlNeedle)) ?? tabs[0];

      if (!tab) {
        throw new Error('No tabs available');
      }

      const result = await request({to: tab.actor, type: 'reloadDescriptor', bypassCache: true});
      console.log(JSON.stringify({ok: true, url: tab.url, result}, null, 2));
      return;
    }

    if (command === 'install') {
      const [addonPath, openDevTools] = args;

      if (!addonPath) {
        throw new Error('Missing on-device path to the .xpi');
      }

      const root = await getRoot(request);
      const result = await request({
        to: root.addonsActor,
        type: 'installTemporaryAddon',
        addonPath,
        openDevTools: openDevTools === 'true',
      });
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (command === 'reload') {
      const [needle] = args;
      const {addons} = await request({to: 'root', type: 'listAddons'});
      const addon = addons.find((candidate) => candidate.id === needle || candidate.name === needle);

      if (!addon) {
        throw new Error(`Add-on not found: ${needle}`);
      }

      const result = await request({to: addon.actor, type: 'reload'});
      console.log(JSON.stringify({ok: true, id: addon.id, result}, null, 2));
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } finally {
    close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
