// Downloads the old Chrome versions listed in browser-matrix.ts into
// e2e/.browsers/ (stephanrauh/ngx-extended-pdf-viewer#3273).
//
//   npm run test:e2e:install-old-browsers             all of them
//   npm run test:e2e:install-old-browsers chrome-126  just the ones named
//
// The builds come from Chrome for Testing. A browser that is already there is
// skipped. Each one takes about 300 MB on disk. Runs on macOS and Linux x64
// (Chrome for Testing has no Linux arm64 builds). Needs Node 23.6+ to import
// the TypeScript matrix directly.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { BROWSER_MATRIX, executablePath } from './browser-matrix.ts';

const BROWSERS_DIR = path.join(import.meta.dirname, '.browsers');
const MILESTONES_URL =
  'https://googlechromelabs.github.io/chrome-for-testing/latest-versions-per-milestone-with-downloads.json';

async function fetchOk(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${url}`);
  }
  return res;
}

async function chromeUrl(milestones, major) {
  const platform =
    process.platform === 'darwin' ? (process.arch === 'arm64' ? 'mac-arm64' : 'mac-x64') : 'linux64';
  const url = milestones[String(major)]?.downloads.chrome?.find((d) => d.platform === platform)?.url;
  if (!url) {
    throw new Error(`Chrome for Testing has no ${major} build for ${platform}`);
  }
  return url;
}

async function install(entry, milestones) {
  const target = path.join(BROWSERS_DIR, entry.name);
  if (existsSync(executablePath(BROWSERS_DIR, entry))) {
    console.log(`${entry.name}: already installed`);
    return;
  }
  console.log(`${entry.name}: ${entry.reason}`);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  const tmp = mkdtempSync(path.join(tmpdir(), `${entry.name}-`));
  try {
    const url = await chromeUrl(milestones, entry.major);
    const zip = path.join(tmp, 'chrome.zip');
    console.log(`  downloading ${url}`);
    writeFileSync(zip, Buffer.from(await (await fetchOk(url)).arrayBuffer()));
    execFileSync('unzip', ['-q', zip, '-d', target]);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  if (!existsSync(executablePath(BROWSERS_DIR, entry))) {
    throw new Error(`${entry.name}: unpacked, but ${executablePath(BROWSERS_DIR, entry)} is missing`);
  }
  console.log(`${entry.name}: installed`);
}

const wanted = process.argv.slice(2);
const unknown = wanted.filter((name) => !BROWSER_MATRIX.some((e) => e.name === name));
if (unknown.length > 0) {
  console.error(`Unknown browser(s): ${unknown.join(', ')}. Known: ${BROWSER_MATRIX.map((e) => e.name).join(', ')}`);
  process.exit(1);
}
const { milestones } = await (await fetchOk(MILESTONES_URL)).json();
for (const entry of BROWSER_MATRIX) {
  if (wanted.length === 0 || wanted.includes(entry.name)) {
    await install(entry, milestones);
  }
}
