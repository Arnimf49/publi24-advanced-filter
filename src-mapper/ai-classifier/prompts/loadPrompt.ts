import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const loadPrompt = (relativePath: string): string =>
  readFileSync(resolve(__dirname, relativePath), 'utf8').trim();
