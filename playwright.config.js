const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './test/api',
  timeout: 30000,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }], ['json', { outputFile: 'evidence/api/results.json' }], ['junit', { outputFile: 'evidence/api/results.xml' }]],
  use: {
    baseURL: 'https://restful-booker.herokuapp.com',
    extraHTTPHeaders: { Accept: 'application/json' },
  },
});

