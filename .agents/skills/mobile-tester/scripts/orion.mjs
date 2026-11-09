#!/usr/bin/env node
// Build and serve the extension packages used by Orion on iPhone/iPad.
//
// Orion iOS installs local extensions from a file, not from a desktop debugger.
// This script stages the current ./dist build and produces:
//   - a CRX3 package (Chrome-extension mode)
//   - an XPI package (Firefox-extension mode, background scripts instead of a
//     MV3 service worker)
// and, when asked to serve, exposes them over the LAN with a QR code.
//
// Usage:
//   node orion.mjs build
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

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(SCRIPT_DIR, '..');
const ROOT = path.resolve(SKILL_DIR, '../../..');
const MOBILE_DIR = path.join(SKILL_DIR, '.mobile', 'orion');
const PACKAGE_DIR = path.join(MOBILE_DIR, 'packages');
const KEY_PATH = path.join(MOBILE_DIR, 'signing-key.pem');
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

function stageExtension(mode) {
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

function buildPackages() {
  if (!fs.existsSync(path.join(ROOT, 'dist/common/background/background.js'))) {
    throw new Error('Missing ./dist build. Start the rollup watcher first (npm run rollup).');
  }

  fs.rmSync(PACKAGE_DIR, {recursive: true, force: true});
  fs.mkdirSync(PACKAGE_DIR, {recursive: true});

  const version = readManifest().version;
  const chromeStage = stageExtension('chrome');
  const firefoxStage = stageExtension('firefox');

  const crxPath = path.join(PACKAGE_DIR, `publi24-${version}-chrome.crx`);
  const xpiPath = path.join(PACKAGE_DIR, `publi24-${version}-firefox.xpi`);

  log('Packaging Chrome-extension build (CRX3)');
  crx3.pack(chromeStage, crxPath, KEY_PATH);

  log('Packaging Firefox-extension build (XPI)');
  zipDirectory(firefoxStage, xpiPath);

  log(`Created ${crxPath}`);
  log(`Created ${xpiPath}`);

  return {version, crxPath, xpiPath};
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

function runCommand(command, args) {
  const result = spawnSync(command, args, {encoding: 'utf8'});

  return {
    found: result.error?.code !== 'ENOENT',
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    status: result.status,
  };
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

  log('Local address');
  console.log(`  http://${localAddress()}:${DEFAULT_PORT}/`);

  log('iPhone/iPad');
  const idevice = runCommand('idevice_id', ['-l']);

  if (!idevice.found) {
    console.log('  libimobiledevice-utils is not installed (optional; only needed for USB inspection).');
  } else if (idevice.stdout.trim()) {
    console.log(`  ${idevice.stdout.trim()}`);
  } else {
    console.log('  No paired iOS device over USB.');
  }

  const usb = runCommand('lsusb', []);
  const apple = usb.stdout.split('\n').filter((line) => line.includes('05ac:'));

  if (apple.length > 0) {
    console.log(`  Apple USB device present: ${apple.join(', ')}`);
  } else {
    console.log('  No Apple USB device visible. LAN install does not need USB.');
  }
}

async function main() {
  const [command = 'status', portArg] = process.argv.slice(2);
  const port = Number(portArg ?? DEFAULT_PORT);

  if (command === 'build') {
    buildPackages();
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

  throw new Error('Usage: orion.mjs <build|serve|status> [port]');
}

main().catch((error) => {
  console.error(`[orion] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
