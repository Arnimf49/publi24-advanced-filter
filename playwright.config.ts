import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  use: {
    screenshot: 'on-first-failure',
    video: 'on-first-retry',
    trace: 'on-first-retry',
  },

  globalSetup: './tests/helpers/globalSetup.ts',

  projects: [
    {
      name: 'chromium',
      use: {
        viewport: {width: 1920, height: 1050},
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        locale: 'en-US',
        permissions: ['geolocation'],
        headless: false,
        actionTimeout: 15000,
        launchOptions: {
          ...(process.env.PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH
            ? {
                executablePath: process.env.PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH,
              }
            : {}),
        }
      },
      timeout: 40000,
      expect: {
        timeout: 15000,
      }
    }
  ]
});
