/**
 * Old Chrome versions the e2e suite runs against, on top of Playwright's own
 * Chromium and WebKit (stephanrauh/ngx-extended-pdf-viewer#3273).
 *
 * The library picks one of two pdf.js bundles at runtime: the modern one, which
 * ships no polyfills, or the legacy `-es5` one. The browser probe in
 * `op-chaining-support.js` makes that decision. These versions sit on both sides
 * of its thresholds, so a stale probe, a wrong worker or a missing fallback
 * shows up as a failing test instead of a blank page on someone's old laptop.
 *
 * Thresholds (MDN browser-compat-data, which caniuse uses for JS APIs):
 *   - modern bundle: needs Map.prototype.getOrInsertComputed (Chrome 145) and
 *     Math.sumPrecise (Chrome 147), among others
 *   - CSS round(): Chrome 125 - older browsers need the calc() fallback in
 *     setLayerDimensions(), in either bundle
 *
 * Only Chrome: Chrome for Testing has every version since 113 as a download,
 * and most compatibility bugs show up there first. Old Safari versions don't run
 * next to the current one, and Playwright's WebKit is not Safari - use
 * BrowserStack for those.
 *
 * `npm run test:e2e:install-old-browsers` downloads the browsers into
 * e2e/.browsers/. The config only adds a project for a browser that is there.
 */
export type BrowserMatrixEntry = {
  /** Playwright project name and folder below e2e/.browsers/. */
  name: string;
  /** Chrome major version. The installer picks its latest build. */
  major: number;
  /** The bundle the library must choose for this browser. */
  expectedBundle: 'modern' | 'es5';
  /** Why this version is in the list. */
  reason: string;
  /**
   * The tests this browser runs:
   *   - 'all':    the whole suite. Replaces Playwright's own Chromium, which then
   *               only runs when this browser isn't installed (fresh checkout).
   *   - 'render': the compatibility spec (T37) and the render tests (T2, every
   *               viewer route renders).
   *   - 'compat': the compatibility spec (T37) only.
   * Browsers between the edges take the same code path as their neighbours, so
   * more tests on them would only add run time.
   */
  tests: 'all' | 'render' | 'compat';
};

/**
 * Where the installer puts a browser's executable. `browsersDir` is passed in
 * rather than derived here, because the installer runs as a plain Node ES
 * module (no __dirname) and the Playwright config as transpiled CommonJS.
 */
export function executablePath(browsersDir: string, entry: BrowserMatrixEntry): string {
  const dir = `${browsersDir}/${entry.name}`;
  return process.platform === 'darwin'
    ? `${dir}/chrome-mac-${process.arch === 'arm64' ? 'arm64' : 'x64'}/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
    : `${dir}/chrome-linux64/chrome`;
}

export const BROWSER_MATRIX: BrowserMatrixEntry[] = [
  {
    name: 'chrome-116',
    major: 116,
    expectedBundle: 'es5',
    reason: 'no CSS round() (Chrome 125): pages stay blank without the calc() fallback',
    tests: 'render',
  },
  {
    name: 'chrome-126',
    major: 126,
    expectedBundle: 'es5',
    reason: 'the #3273 report: got the modern bundle and died on Promise.try / toHex',
    tests: 'compat',
  },
  {
    name: 'chrome-146',
    major: 146,
    expectedBundle: 'es5',
    reason: 'the last Chrome without Math.sumPrecise',
    tests: 'compat',
  },
  {
    name: 'chrome-147',
    major: 147,
    expectedBundle: 'modern',
    reason: 'the oldest Chrome that runs the modern bundle',
    tests: 'all',
  },
];
