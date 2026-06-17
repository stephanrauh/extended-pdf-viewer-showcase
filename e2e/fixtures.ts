import { test as base, expect, type ConsoleMessage } from '@playwright/test';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import * as path from 'node:path';

/**
 * Pick the pdf.js build the whole e2e suite runs against, based on the branch
 * currently checked out in the sibling `mypdf.js` repo:
 *
 *   - branch name contains "bleeding-edge"  → every test runs against the
 *     bleeding-edge build (the showcase's `assetsFolder: 'bleeding-edge'`),
 *     so the suite validates whatever engine you're developing on;
 *   - `../mypdf.js` is missing, is not a git work tree, or is on any other
 *     branch / a stable tag / detached HEAD  → default to the stable build.
 *
 * The switch is driven through the same `showcase.viewer` localStorage key the
 * app itself uses (see nav.component.ts#activateViewer), seeded below.
 */
function detectBleedingEdge(): boolean {
  // fixtures.ts lives in <showcase>/e2e, so mypdf.js is two levels up.
  const mypdfDir = path.resolve(__dirname, '../../mypdf.js');
  try {
    if (!existsSync(mypdfDir)) return false;
    const git = (args: string): string =>
      execSync(`git -C "${mypdfDir}" ${args}`, {
        stdio: ['ignore', 'pipe', 'ignore'],
      })
        .toString()
        .trim();
    if (git('rev-parse --is-inside-work-tree') !== 'true') return false;
    return /bleeding-edge/i.test(git('rev-parse --abbrev-ref HEAD'));
  } catch {
    // No git, no repo, or any other failure → safe stable default.
    return false;
  }
}

/** True when the suite should exercise the bleeding-edge pdf.js build. */
export const usingBleedingEdge = detectBleedingEdge();

// eslint-disable-next-line no-console
console.log(
  `[e2e] mypdf.js → running against the ${usingBleedingEdge ? 'bleeding-edge' : 'stable'} build`,
);

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
      // Align the whole suite with the checked-out mypdf.js branch: when it's
      // bleeding-edge, switch the showcase to the bleeding-edge build for every
      // test (same key the in-app viewer switch uses). On stable we leave the
      // app's own default ('assets') untouched.
      if (usingBleedingEdge) {
        await page.addInitScript(() => {
          localStorage.setItem('showcase.viewer', 'bleeding-edge');
        });
      }
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
