import { BrowserSession } from './BrowserSession.js';
import { instance } from './instance.js';

const createSession = async (domain: string): Promise<BrowserSession> => {
  const browserInst = await instance.ensureBrowser();
  const page = await browserInst.contexts()[0].newPage();
  await instance.positionBrowserWindow(page, instance.getDesiredWindowBounds());
  return new BrowserSession(page, domain);
};

const closeSession = async (session: BrowserSession): Promise<void> => {
  await session.close();
};

const closeAll = async (): Promise<void> => {
  await instance.closeAll();
};

export const browser = {
  createSession,
  closeSession,
  closeAll,
};

export { BrowserSession } from './BrowserSession.js';
