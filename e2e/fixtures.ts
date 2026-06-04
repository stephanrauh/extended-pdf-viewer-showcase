import { test as base, expect, type ConsoleMessage } from '@playwright/test';

type Fixtures = {
  consoleLog: ConsoleMessage[];
  pageErrors: Error[];
  failedRequests: string[];
  seedStorage: void;
};

export const test = base.extend<Fixtures>({
  seedStorage: [
    async ({ page }, use) => {
      // The showcase remembers a few demo toggles in localStorage. Seed the
      // ones whose default would break tests under a fresh-profile run.
      await page.addInitScript(() => {
        // /simple defaults this to `true`, but the fast `npm run build:lib`
        // dev build skips producing `viewer-*.min.mjs` (only the published
        // npm package ships minified). Force the unminified bundle so the
        // local dev build can serve the request.
        localStorage.setItem(
          'ngx-extended-pdf-viewer.simple.minifiedJSLibraries',
          'false',
        );
      });
      await use(undefined);
    },
    { auto: true },
  ],

  consoleLog: [
    async ({ page }, use, testInfo) => {
      const messages: ConsoleMessage[] = [];
      page.on('console', (msg) => messages.push(msg));

      await use(messages);

      if (messages.length === 0) return;
      const body = messages
        .map((m) => `[${m.type()}] ${m.text()}`)
        .join('\n');
      await testInfo.attach('console.log', {
        body,
        contentType: 'text/plain',
      });
      if (testInfo.status !== testInfo.expectedStatus) {
        // eslint-disable-next-line no-console
        console.log(
          `\n=== console.log captured for "${testInfo.title}" ===\n${body}\n=== end ===\n`,
        );
      }
    },
    { auto: true },
  ],

  pageErrors: [
    async ({ page }, use, testInfo) => {
      const errors: Error[] = [];
      page.on('pageerror', (err) => errors.push(err));

      await use(errors);

      if (errors.length === 0) return;
      const body = errors
        .map((e) => `${e.name}: ${e.message}\n${e.stack ?? ''}`)
        .join('\n\n');
      await testInfo.attach('pageerrors.log', {
        body,
        contentType: 'text/plain',
      });
      if (testInfo.status !== testInfo.expectedStatus) {
        // eslint-disable-next-line no-console
        console.log(
          `\n=== pageerrors captured for "${testInfo.title}" ===\n${body}\n=== end ===\n`,
        );
      }
    },
    { auto: true },
  ],

  failedRequests: [
    async ({ page }, use, testInfo) => {
      const failed: string[] = [];
      page.on('response', (res) => {
        if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
      });
      page.on('requestfailed', (req) => {
        failed.push(`FAILED ${req.url()} (${req.failure()?.errorText ?? 'unknown'})`);
      });

      await use(failed);

      if (failed.length === 0) return;
      const body = failed.join('\n');
      await testInfo.attach('failed-requests.log', {
        body,
        contentType: 'text/plain',
      });
      if (testInfo.status !== testInfo.expectedStatus) {
        // eslint-disable-next-line no-console
        console.log(
          `\n=== failed requests for "${testInfo.title}" ===\n${body}\n=== end ===\n`,
        );
      }
    },
    { auto: true },
  ],
});

export { expect };
