import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI && !process.env.DEBUG,
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
      name: 'publi24',
      testDir: './tests/publi24',
      use: {
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
    },
    {
      name: 'nimfomane',
      testDir: './tests/nimfomane',
      use: {
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
