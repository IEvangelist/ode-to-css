import { defineConfig, devices } from '@playwright/test';

const deployedBaseURL = process.env.DEPLOYED_BASE_URL;

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  reporter: [['list']],
  use: {
    baseURL: deployedBaseURL || 'http://127.0.0.1:4173',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: deployedBaseURL
    ? undefined
    : {
        command: 'npm run preview',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
      }
});
