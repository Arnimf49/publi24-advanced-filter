#!/usr/bin/env node
// Minimal CRX3 packer (Chrome extension package format v3).
//
// Usage:
//   node crx3.mjs <extension-dir> <out.crx> [private-key.pem]
//
// The private key is created on first use and reused afterwards, so Orion keeps
// the same extension id between builds. The output is a valid CRX3 file:
// "Cr24" + version 3 + protobuf header + ZIP payload.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const MAGIC = Buffer.from('Cr24', 'ascii');
const VERSION = 3;
const SIGNATURE_CONTEXT = Buffer.from('CRX3 SignedData\x00', 'binary');

function encodeVarint(value) {
  const bytes = [];
  let remaining = value;

  while (remaining > 0x7f) {
    bytes.push((remaining & 0x7f) | 0x80);
    remaining = Math.floor(remaining / 128);
  }

  bytes.push(remaining);

  return Buffer.from(bytes);
}

function encodeBytesField(fieldNumber, value) {
  return Buffer.concat([
    encodeVarint((fieldNumber << 3) | 2),
    encodeVarint(value.length),
    value,
  ]);
}

function encodeUint32LE(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value, 0);

  return buffer;
}

function loadOrCreatePrivateKey(keyPath) {
  if (fs.existsSync(keyPath)) {
    return crypto.createPrivateKey(fs.readFileSync(keyPath));
  }

  const {privateKey} = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  fs.mkdirSync(path.dirname(keyPath), {recursive: true});
  fs.writeFileSync(keyPath, privateKey.export({type: 'pkcs8', format: 'pem'}), {
    mode: 0o600,
  });
  console.log(`[crx3] generated signing key ${keyPath}`);

  return privateKey;
}

function zipDirectory(directory, zipPath) {
  fs.rmSync(zipPath, {force: true});
  execFileSync('zip', ['-qr', '-X', zipPath, '.'], {cwd: directory});

  return fs.readFileSync(zipPath);
}

function buildCrx(directory, crxPath, keyPath) {
  const privateKey = loadOrCreatePrivateKey(keyPath);
  const publicKey = crypto.createPublicKey(privateKey);
  const publicKeyDer = publicKey.export({type: 'spki', format: 'der'});
  const crxId = crypto.createHash('sha256').update(publicKeyDer).digest().subarray(0, 16);

  const zipPath = `${crxPath}.zip`;
  const zip = zipDirectory(directory, zipPath);

  const signedHeaderData = encodeBytesField(1, crxId);
  const signaturePayload = Buffer.concat([
    SIGNATURE_CONTEXT,
    encodeUint32LE(signedHeaderData.length),
    signedHeaderData,
    zip,
  ]);
  const signature = crypto.sign('sha256', signaturePayload, privateKey);

  const proof = Buffer.concat([
    encodeBytesField(1, publicKeyDer),
    encodeBytesField(2, signature),
  ]);
  const header = Buffer.concat([
    encodeBytesField(2, proof),
    encodeBytesField(10000, signedHeaderData),
  ]);

  const crx = Buffer.concat([
    MAGIC,
    encodeUint32LE(VERSION),
    encodeUint32LE(header.length),
    header,
    zip,
  ]);

  fs.mkdirSync(path.dirname(crxPath), {recursive: true});
  fs.writeFileSync(crxPath, crx);
  fs.rmSync(zipPath, {force: true});

  return {crxPath, crxId: crxId.toString('hex')};
}

export const crx3 = {
  pack: buildCrx,
};

async function main() {
  const [directory, crxPath, keyPath] = process.argv.slice(2);

  if (!directory || !crxPath) {
    throw new Error('Usage: crx3.mjs <extension-dir> <out.crx> [private-key.pem]');
  }

  const resolvedKey = keyPath ?? `${crxPath}.key.pem`;
  const result = buildCrx(path.resolve(directory), path.resolve(crxPath), path.resolve(resolvedKey));
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
