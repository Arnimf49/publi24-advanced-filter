import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { execFileSync } from 'node:child_process';
import { FingerprintGenerator } from 'fingerprint-generator';
import { FingerprintInjector } from 'fingerprint-injector';
import { config } from '../config.js';

type WindowBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

let browserInstance: Browser | null = null;
let browserContext: BrowserContext | null = null;

const getDesiredWindowBounds = (): WindowBounds | null => {
  try {
    const output = execFileSync('xrandr', ['--current'], { encoding: 'utf8' });
    const lines = output.split('\n');
    const displayLine =
      lines.find((line) => /\bconnected primary\b/.test(line) && /\d+x\d+\+\d+\+\d+/.test(line)) ??
      lines.find((line) => /\bconnected\b/.test(line) && /\d+x\d+\+\d+\+\d+/.test(line));

    if (!displayLine) {
      return null;
    }

    const match = displayLine.match(/(\d+)x(\d+)\+(\d+)\+(\d+)/);
    if (!match) {
      return null;
    }

    const [, totalWidthText, totalHeightText, leftText, topText] = match;
    const totalWidth = Number(totalWidthText);
    const totalHeight = Number(totalHeightText);
    const displayLeft = Number(leftText);
    const displayTop = Number(topText);
    const width = Math.max(900, Math.floor(totalWidth / 2));
    const height = Math.max(700, totalHeight);

    return {
      left: displayLeft + Math.max(0, totalWidth - width),
      top: displayTop,
      width,
      height,
    };
  } catch {
    return null;
  }
};

const positionBrowserWindow = async (page: Page, desiredBounds: WindowBounds | null): Promise<void> => {
  if (config.headless || !desiredBounds) {
    return;
  }

  const session = await page.context().newCDPSession(page);
  const { windowId } = await session.send('Browser.getWindowForTarget');

  await session.send('Browser.setWindowBounds', {
    windowId,
    bounds: {
      windowState: 'normal',
    },
  });

  await session.send('Browser.setWindowBounds', {
    windowId,
    bounds: {
      left: desiredBounds.left,
      top: desiredBounds.top,
      width: desiredBounds.width,
      height: desiredBounds.height,
    },
  });
};

const ensureBrowser = async (): Promise<Browser> => {
  if (!browserInstance) {
    const desiredBounds = getDesiredWindowBounds();
    const { fingerprint, headers } = new FingerprintGenerator({
      locales: ['en-US'],
    }).getFingerprint({
      devices: ['desktop'],
      operatingSystems: ['linux'],
      browserListQuery: 'last 10 Chrome versions',
    });

    browserInstance = await chromium.launch({
      headless: config.headless,
      channel: 'chromium',
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        ...(desiredBounds
          ? [
              `--window-position=${desiredBounds.left},${desiredBounds.top}`,
              `--window-size=${desiredBounds.width},${desiredBounds.height}`,
            ]
          : ['--start-maximized']),
      ],
      ...(process.env.PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH
        ? {
            executablePath: process.env.PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH,
          }
        : {}),
    });
    browserContext = await browserInstance.newContext({
      viewport: null,
      ignoreHTTPSErrors: true,
      extraHTTPHeaders: {
        'accept-language': headers['accept-language'],
      },
      userAgent: fingerprint.navigator.userAgent,
      colorScheme: 'dark',
    });
    await new FingerprintInjector().attachFingerprintToPlaywright(browserContext, { fingerprint, headers });
  }

  return browserInstance;
};

const closeAll = async (): Promise<void> => {
  await browserContext?.close();
  await browserInstance?.close();
  browserContext = null;
  browserInstance = null;
};

export const instance = {
  ensureBrowser,
  closeAll,
  positionBrowserWindow,
  getDesiredWindowBounds,
};
