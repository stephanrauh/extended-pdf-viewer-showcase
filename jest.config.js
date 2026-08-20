const { createCjsPreset } = require('jest-preset-angular/presets');

/** @type {import('jest').Config} */
module.exports = {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  // Playwright owns e2e/; jest must not pick those specs up.
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/e2e/', '/.angular/'],
  // marked (via ngx-markdown) is ESM-only and ships .js, so the preset's default
  // "only transform .mjs" rule skips it and Node chokes on `export`.
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@angular/common/locales/.*\\.js$|marked/|ngx-markdown/))',
  ],
};
