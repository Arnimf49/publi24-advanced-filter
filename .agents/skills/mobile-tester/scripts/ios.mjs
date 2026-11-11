#!/usr/bin/env node
// Shared helpers for talking to an iPhone/iPad over USB.
//
// Everything here is built on pymobiledevice3, which is the only host-side
// toolkit that can reach iOS 17+ services (Web Inspector, containers) without
// Xcode. Install it once:
//
//   pipx install pymobiledevice3
//
// The binary is resolved from PYMOBILEDEVICE3, PATH, ~/.local/bin, or a
// skill-local virtualenv at .mobile/venv/bin/.
//
// Public API is the `ios` object at the bottom of the file.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(SCRIPT_DIR, '..');

const ORION_BUNDLE_ID = 'com.kagi.kagiiOS';
const INSTALL_HINT =
  'pymobiledevice3 is missing. Install it with "pipx install pymobiledevice3" '
  + 'or set PYMOBILEDEVICE3 to the binary path.';

function log(message) {
  console.log(`[ios] ${message}`);
}

function resolveBinary() {
  const candidates = [
    process.env.PYMOBILEDEVICE3,
    path.join(os.homedir(), '.local', 'bin', 'pymobiledevice3'),
    path.join(SKILL_DIR, '.mobile', 'venv', 'bin', 'pymobiledevice3'),
  ].filter(Boolean);

  const onPath = spawnSync('sh', ['-c', 'command -v pymobiledevice3'], {
    encoding: 'utf8',
  });

  if (onPath.status === 0 && onPath.stdout.trim()) {
    candidates.push(onPath.stdout.trim());
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function binary() {
  const resolved = resolveBinary();

  if (!resolved) {
    throw new Error(INSTALL_HINT);
  }

  return resolved;
}

function run(args, options = {}) {
  const result = spawnSync(binary(), args, {
    encoding: 'utf8',
    timeout: options.timeout ?? 60_000,
    input: options.input,
    maxBuffer: 32 * 1024 * 1024,
  });

  if (result.error) {
    throw new Error(`pymobiledevice3 ${args.join(' ')} failed: ${result.error.message}`);
  }

  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  };
}

function devices() {
  const result = run(['usbmux', 'list'], {timeout: 20_000});

  if (result.status !== 0) {
    // Older versions print nothing when no device is attached.
    return [];
  }

  try {
    const parsed = JSON.parse(result.stdout);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    throw new Error(`Could not parse "pymobiledevice3 usbmux list": ${error.message}`);
  }
}

// Runs commands inside an app's Documents container. pymobiledevice3's
// one-shot `apps push --documents` currently fails with AFC PERM_DENIED, so the
// interactive AFC shell is driven over stdin instead.
function documentsShell(bundleId, lines, timeout = 180_000) {
  const result = spawnSync(
    binary(),
    ['apps', 'afc', '--documents', bundleId],
    {
      encoding: 'utf8',
      timeout,
      input: lines.map((line) => `${line}\n`).join(''),
      maxBuffer: 32 * 1024 * 1024,
    },
  );

  if (result.error) {
    throw new Error(`AFC shell failed: ${result.error.message}`);
  }

  // The shell echoes each command and prints command errors on stdout.
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const failure = output.split('\n').find((line) => /PERM_DENIED|error:|No such file/.test(line));

  if (failure) {
    throw new Error(`AFC shell reported: ${failure.trim()}`);
  }

  return output;
}

function pushFiles(files, bundleId = ORION_BUNDLE_ID) {
  const lines = [];

  for (const file of files) {
    if (!fs.existsSync(file.local)) {
      throw new Error(`Missing local file: ${file.local}`);
    }

    lines.push(`push "${file.local}" "${file.remote}"`);
  }

  for (const file of files) {
    lines.push(`stat "${file.remote}"`);
  }

  log(`Pushing ${files.length} file(s) to ${bundleId}/Documents over USB`);

  const output = documentsShell(bundleId, lines);
  const missing = files.filter((file) => !output.includes(file.remote));

  if (missing.length > 0) {
    throw new Error(
      `These files did not land in the app container: ${missing.map((file) => file.remote).join(', ')}`,
    );
  }

  return files.map((file) => ({remote: file.remote, local: file.local}));
}

// Deletes stale package copies from the app's Documents folder so Orion's file
// picker only shows the builds from the latest deploy.
function ensureDirectory(remotePath, bundleId = ORION_BUNDLE_ID) {
  const [top] = remotePath.split('/');

  if (!listDocuments(bundleId).includes(top)) {
    documentsShell(bundleId, [`mkdir "${remotePath}"`]);
  }

  return remotePath;
}

function pruneDocuments(pattern, keep = [], bundleId = ORION_BUNDLE_ID) {
  const names = listDocuments(bundleId).filter((name) => pattern.test(name));
  const stale = names.filter((name) => !keep.includes(name));

  if (stale.length === 0) {
    return [];
  }

  documentsShell(bundleId, stale.map((name) => `rm "${name}"`));
  log(`Removed ${stale.length} stale file(s) from ${bundleId}/Documents`);

  return stale;
}

function readDocumentsFile(name, lines = 80, bundleId = ORION_BUNDLE_ID) {
  if (!Number.isInteger(lines) || lines < 1) {
    throw new Error(`Invalid line count: ${lines}`);
  }

  // Every output line is tagged so the shell's banner and prompt echoes can be
  // filtered out of the transcript.
  const output = documentsShell(bundleId, [`cat "${name}" | tail -n ${lines} | sed 's/^/@@ /'`]);

  return output
    .split('\n')
    .filter((line) => line.startsWith('@@ '))
    .map((line) => line.slice(3))
    .join('\n');
}

function listDocuments(bundleId = ORION_BUNDLE_ID) {
  const output = documentsShell(bundleId, ['ls']);
  // The AFC shell interleaves banner text and prompt echoes with the listing;
  // real entries are single tokens.
  const names = output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[\w.-]+$/.test(line));

  return [...new Set(names)];
}

export const ios = {
  installHint: INSTALL_HINT,
  orionBundleId: ORION_BUNDLE_ID,
  available() {
    return resolveBinary() !== null;
  },
  binary: () => binary(),
  run: (args, options) => run(args, options),
  devices: () => devices(),
  pushFiles,
  pruneDocuments,
  ensureDirectory,
  readDocumentsFile,
  listDocuments,
};
