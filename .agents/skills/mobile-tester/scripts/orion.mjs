#!/usr/bin/env node
// Build the extension packages used by Orion on iPhone/iPad and deliver them.
//
// Orion iOS installs local extensions from a file, not from a desktop debugger.
// This script stages the current ./dist build and produces:
//   - a CRX3 package (Chrome-extension mode)
//   - an XPI package (Firefox-extension mode, background scripts instead of a
//     MV3 service worker)
//
// Delivery is either:
//   - `push`: copy both packages straight into Orion's Documents folder over
//     USB, so nothing has to be downloaded on the phone (preferred), or
//   - `serve`: expose them over the LAN with a QR code (no USB needed).
//
// Usage:
//   node orion.mjs build [--stamp]
//   node orion.mjs push [--stamp]        # first-time install: packages + unpacked folder
//   node orion.mjs sync [--stamp]        # update the installed folder + reload (no taps)
//   node orion.mjs serve [port]
//   node orion.mjs status
//
// Environment:
//   ORION_PORT   Port for `serve` (default 8088).
//
// This script assumes the rollup watcher is already writing ./dist.

import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {crx3} from './crx3.mjs';
import {ios} from './ios.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(SCRIPT_DIR, '..');
const ROOT = path.resolve(SKILL_DIR, '../../..');
const MOBILE_DIR = path.join(SKILL_DIR, '.mobile', 'orion');
const PACKAGE_DIR = path.join(MOBILE_DIR, 'packages');
const KEY_PATH = path.join(MOBILE_DIR, 'signing-key.pem');
const STAMP_PATH = path.join(MOBILE_DIR, 'stamp.json');
const REMOTE_EXT_DIR = 'publi24-ext';
const DEFAULT_PORT = Number(process.env.ORION_PORT ?? 8088);

const MIME_TYPES = {
  '.crx': 'application/x-chrome-extension',
  '.xpi': 'application/x-xpinstall',
  '.zip': 'application/zip',
};

function log(message) {
  console.log(`[orion] ${message}`);
}

function readManifest() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
}

function stageExtension(mode, version) {
  const stagePath = path.join(MOBILE_DIR, mode);

  fs.rmSync(stagePath, {recursive: true, force: true});
  fs.mkdirSync(stagePath, {recursive: true});

  for (const directory of ['dist', 'library']) {
    fs.cpSync(path.join(ROOT, directory), path.join(stagePath, directory), {
      recursive: true,
    });
  }

  for (const file of ['icon.png', 'escort-listing-domains.json']) {
    const source = path.join(ROOT, file);

    if (fs.existsSync(source)) {
      fs.copyFileSync(source, path.join(stagePath, file));
    }
  }

  const manifest = readManifest();

  if (version) {
    manifest.version = version;
  }

  if (mode === 'firefox') {
    // WebKit/Gecko use an event page, not a MV3 service worker.
    manifest.background = {scripts: ['dist/common/background/background.js']};
  }

  fs.writeFileSync(
    path.join(stagePath, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  return stagePath;
}

function zipDirectory(directory, zipPath) {
  fs.rmSync(zipPath, {force: true});
  spawnSync('zip', ['-qr', '-X', zipPath, '.'], {cwd: directory, stdio: 'inherit'});

  if (!fs.existsSync(zipPath)) {
    throw new Error(`Failed to create ${zipPath}`);
  }

  return zipPath;
}

function stageBuild({stamp = false} = {}) {
  if (!fs.existsSync(path.join(ROOT, 'dist/common/background/background.js'))) {
    throw new Error('Missing ./dist build. Start the rollup watcher first (npm run rollup).');
  }

  const version = stamp ? stampedVersion() : readManifest().version;
  const stagePath = stageExtension('chrome', version);

  return {version, stagePath};
}

function buildPackages({stamp = false} = {}) {
  const {version, stagePath: chromeStage} = stageBuild({stamp});
  const firefoxStage = stageExtension('firefox', version);

  fs.rmSync(PACKAGE_DIR, {recursive: true, force: true});
  fs.mkdirSync(PACKAGE_DIR, {recursive: true});

  const crxPath = path.join(PACKAGE_DIR, `publi24-${version}-chrome.crx`);
  const xpiPath = path.join(PACKAGE_DIR, `publi24-${version}-firefox.xpi`);

  log(`Packaging version ${version}`);

  if (stamp) {
    log('Stamped version (Orion may refuse to replace an identical version)');
  }

  log('Packaging Chrome-extension build (CRX3)');
  crx3.pack(chromeStage, crxPath, KEY_PATH);

  log('Packaging Firefox-extension build (XPI)');
  zipDirectory(firefoxStage, xpiPath);

  log(`Created ${crxPath}`);
  log(`Created ${xpiPath}`);

  return {version, crxPath, xpiPath, stagePath: chromeStage};
}

// Pushes the unpacked build into the folder Orion installed from. Pushing each
// top-level entry into an existing directory keeps the layout flat (AFC nests a
// pushed directory under its own name).
function uploadExtensionFolder(stagePath, version) {
  ios.ensureDirectory(REMOTE_EXT_DIR);

  const entries = fs.readdirSync(stagePath);

  log(`Syncing ${entries.length} entries to ${REMOTE_EXT_DIR} (version ${version})`);
  ios.pushFiles(
    entries.map((name) => ({
      local: path.join(stagePath, name),
      remote: `${REMOTE_EXT_DIR}/${name}`,
    })),
  );

  return entries.length;
}

// Orion keeps a reference to the folder it was installed from, so overwriting
// the files in that folder and reloading the extension is enough to update it -
// no picker interaction.
function syncExtension({stamp = false, reload = true} = {}) {
  const {version, stagePath} = stageBuild({stamp});

  if (!ios.listDocuments().includes(REMOTE_EXT_DIR)) {
    throw new Error(
      `Orion has no "${REMOTE_EXT_DIR}" folder yet. Install it once:\n`
      + '  1. node orion.mjs push\n'
      + '  2. On the phone: Orion -> ••• -> Extensions -> + -> install from file\n'
      + `  3. Install the unpacked folder ${REMOTE_EXT_DIR} (On My iPhone -> Orion)\n`
      + 'Then run sync again.',
    );
  }

  uploadExtensionFolder(stagePath, version);

  if (!reload) {
    log('Skipped the extension reload (--no-reload)');
    return {version, reloaded: false};
  }

  log('Reloading the extension over CDP');
  const result = spawnSync(
    process.execPath,
    [path.join(SCRIPT_DIR, 'orion-cdp.mjs'), 'reload-extension', '--expect', version],
    {encoding: 'utf8', timeout: 180_000},
  );
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();

  if (output) {
    console.log(output);
  }

  if (result.status !== 0) {
    throw new Error(
      `Files were synced but the reload failed (exit ${result.status}). `
      + 'Bring Orion to the foreground and run: node orion-cdp.mjs reload-extension',
    );
  }

  return {version, reloaded: true};
}

// Chrome-style versions allow up to four numeric components. Bumping the last
// one keeps the extension id stable while giving Orion a fresh version to
// install over the previous build.
function stampedVersion() {
  const base = readManifest().version;
  const parts = base.split('.').map((part) => Number.parseInt(part, 10) || 0);
  const counter = readStampCounter() + 1;

  fs.writeFileSync(STAMP_PATH, `${JSON.stringify({counter}, null, 2)}\n`);

  if (parts.length < 4) {
    parts.push(counter);
  } else {
    parts[3] += counter;
  }

  return parts.join('.');
}

function readStampCounter() {
  if (!fs.existsSync(STAMP_PATH)) {
    return 0;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(STAMP_PATH, 'utf8'));

    return Number.isInteger(parsed.counter) ? parsed.counter : 0;
  } catch (error) {
    log(`Ignoring unreadable ${STAMP_PATH}: ${error.message}`);

    return 0;
  }
}

function pushPackages({stamp = false} = {}) {
  const packages = buildPackages({stamp});
  const files = [
    {local: packages.crxPath, remote: path.basename(packages.crxPath)},
    {local: packages.xpiPath, remote: path.basename(packages.xpiPath)},
  ];

  ios.pruneDocuments(
    /^publi24-.*\.(crx|xpi)$/,
    files.map((file) => file.remote),
  );
  ios.pushFiles(files);
  uploadExtensionFolder(packages.stagePath, packages.version);

  log('Uploaded to Orion -> Documents');
  log(`Prefer the folder: Orion -> ••• -> Extensions -> + -> install from file -> On My iPhone -> Orion -> ${REMOTE_EXT_DIR}`);
  log('The folder build can be updated later with "node orion.mjs sync" (no taps).');
  log('The .crx/.xpi are fallbacks if folder install misbehaves.');

  return packages;
}

function localAddress() {
  const candidates = [];

  for (const [name, addresses] of Object.entries(os.networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family !== 'IPv4' || address.internal) {
        continue;
      }

      let score = 0;

      if (/^(wl|en|eth)/.test(name)) {
        score += 4;
      }

      if (/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address.address)) {
        score += 2;
      }

      candidates.push({name, address: address.address, score});
    }
  }

  candidates.sort((left, right) => right.score - left.score);

  return candidates[0]?.address ?? '127.0.0.1';
}

function packageFiles() {
  if (!fs.existsSync(PACKAGE_DIR)) {
    return [];
  }

  return fs.readdirSync(PACKAGE_DIR)
    .filter((name) => MIME_TYPES[path.extname(name)] !== undefined)
    .sort();
}

function indexPage(files, port) {
  const items = files.map((name) => {
    return `<li><a href="/packages/${encodeURIComponent(name)}">${name}</a></li>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Publi24 mobile tester</title>
  <style>
    body { font: 17px/1.45 -apple-system, system-ui, sans-serif; margin: 2rem; max-width: 42rem; }
    code { background: #eee; padding: 0.1rem 0.3rem; border-radius: 0.3rem; }
    li { margin: 0.4rem 0; }
  </style>
</head>
<body>
  <h1>Publi24 mobile tester</h1>
  <p>Install one of these files in Orion on the iPhone/iPad.</p>
  <ul>${items}</ul>
  <p>Orion: <strong>••• → Extensions → + → install from file</strong>, then pick the downloaded package.</p>
  <p>Try the Chrome <code>.crx</code> first. If the background worker does not work, install the Firefox <code>.xpi</code> instead.</p>
  <p>Server: <code>http://${localAddress()}:${port}/</code></p>
</body>
</html>`;
}

function safePackagePath(name) {
  const resolved = path.resolve(PACKAGE_DIR, name);

  if (!resolved.startsWith(`${PACKAGE_DIR}${path.sep}`)) {
    return null;
  }

  return resolved;
}

async function printQr(url) {
  try {
    const QRCode = (await import('qrcode')).default;
    console.log(await QRCode.toString(url, {type: 'terminal', small: true}));
  } catch (error) {
    log(`QR code unavailable: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function serve(port) {
  buildPackages();

  const address = localAddress();
  const url = `http://${address}:${port}/`;

  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? address}`);

    if (requestUrl.pathname === '/health') {
      response.writeHead(200, {'content-type': 'application/json'});
      response.end(JSON.stringify({ok: true, packages: packageFiles()}));
      return;
    }

    if (requestUrl.pathname === '/') {
      response.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      });
      response.end(indexPage(packageFiles(), port));
      return;
    }

    if (requestUrl.pathname.startsWith('/packages/')) {
      const name = decodeURIComponent(requestUrl.pathname.slice('/packages/'.length));
      const filePath = safePackagePath(name);

      if (!filePath || !fs.existsSync(filePath)) {
        response.writeHead(404, {'content-type': 'text/plain'});
        response.end('Not found');
        return;
      }

      response.writeHead(200, {
        'content-type': MIME_TYPES[path.extname(filePath)] ?? 'application/octet-stream',
        'content-length': fs.statSync(filePath).size,
        'content-disposition': `attachment; filename="${path.basename(filePath)}"`,
        'cache-control': 'no-store',
      });
      fs.createReadStream(filePath).pipe(response);
      return;
    }

    response.writeHead(404, {'content-type': 'text/plain'});
    response.end('Not found');
  });

  server.listen(port, '0.0.0.0', async () => {
    log(`Serving ${url}`);
    log('Phone and computer must be on the same network.');
    await printQr(url);
    log('Press Ctrl+C to stop.');
  });

  server.on('error', (error) => {
    console.error(`[orion] Server error: ${error.message}`);
    process.exit(1);
  });
}

function status() {
  const files = packageFiles();

  log('Packages');
  if (files.length === 0) {
    console.log('  No packages yet. Run: node orion.mjs build');
  } else {
    for (const name of files) {
      console.log(`  ${path.join(PACKAGE_DIR, name)}`);
    }
  }

  log('iPhone/iPad');
  if (!ios.available()) {
    console.log(`  ${ios.installHint}`);
    console.log('  Without it only the LAN flow works (node orion.mjs serve).');
  } else {
    const devices = ios.devices();

    if (devices.length === 0) {
      console.log('  No iPhone/iPad over USB. LAN install still works.');
    } else {
      for (const device of devices) {
        console.log(
          `  ${device.DeviceName ?? device.DeviceClass} ${device.ProductType} `
          + `iOS ${device.ProductVersion} (${device.Identifier})`,
        );
      }

      console.log('  USB push and CDP inspection are available.');

      const documents = ios.listDocuments();
      console.log(
        `  ${REMOTE_EXT_DIR}: ${documents.includes(REMOTE_EXT_DIR) ? 'installed folder present' : 'missing (run: node orion.mjs push, then install it on the phone)'}`,
      );
    }
  }

  log('CDP bridge');
  console.log(`  http://127.0.0.1:${process.env.ORION_CDP_PORT ?? 9222}/ (node orion-cdp.mjs status)`);

  log('Local address');
  console.log(`  http://${localAddress()}:${DEFAULT_PORT}/`);
}

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((arg) => arg.startsWith('--')));
  const positional = args.filter((arg) => !arg.startsWith('--'));
  const [command = 'status', portArg] = positional;
  const port = Number(portArg ?? DEFAULT_PORT);
  const stamp = flags.has('--stamp');

  if (command === 'build') {
    buildPackages({stamp});
    return;
  }

  if (command === 'push') {
    pushPackages({stamp});
    return;
  }

  if (command === 'sync') {
    syncExtension({stamp, reload: !flags.has('--no-reload')});
    return;
  }

  if (command === 'serve') {
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port: ${portArg}`);
    }

    await serve(port);
    return;
  }

  if (command === 'status') {
    status();
    return;
  }

  throw new Error('Usage: orion.mjs <build|push|sync|serve|status> [port] [--stamp] [--no-reload]');
}

main().catch((error) => {
  console.error(`[orion] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
