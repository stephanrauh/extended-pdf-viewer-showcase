import { Page, expect } from '@playwright/test';

/**
 * Theming test helpers for #3219.
 *
 * Two orthogonal inputs decide how the viewer looks:
 *   - the **OS** color scheme   (Playwright `colorScheme`, drives `prefers-color-scheme`)
 *   - the **viewer** theme       (`localStorage['ngx-extended-pdf-viewer.theme']`)
 *
 * The library must follow the *viewer* theme regardless of the OS. The bug in
 * #3219 was white-on-white outline text when the two disagreed. These helpers
 * let a test pin both inputs and then audit a UI surface for two things:
 *
 *   1. **Readability** — every visible bit of text (and toolbar icon) has
 *      enough contrast against its actual background (`auditContrast`).
 *   2. **Theme direction** — a panel's effective background matches the chosen
 *      viewer theme, not the OS (`expectThemeDirection`). This is the precise
 *      guard against the #3219 regression: it proves the viewer theme wins.
 *
 * The signal is *computed* (colors + WCAG contrast), never a screenshot —
 * matching the suite's screenshot-averse philosophy.
 */

export type ViewerTheme = 'light' | 'dark';
export type OsScheme = 'light' | 'dark';

export interface ThemeCombo {
  viewer: ViewerTheme;
  os: OsScheme;
}

/** All four OS×viewer combinations, with the two mismatches first (the bug area). */
export const THEME_COMBOS: ThemeCombo[] = [
  { viewer: 'light', os: 'dark' }, // the original #3219 report
  { viewer: 'dark', os: 'light' }, // the mirror image (white panel bug)
  { viewer: 'light', os: 'light' },
  { viewer: 'dark', os: 'dark' },
];

export const comboLabel = (c: ThemeCombo): string =>
  `viewer:${c.viewer} / OS:${c.os}`;

/**
 * Pin the viewer theme and the emulated OS color scheme *before* navigating.
 * Must be called before `page.goto(...)`: the localStorage seed has to be in
 * place before the showcase's ThemeService reads its initial value.
 */
export async function applyThemeContext(
  page: Page,
  combo: ThemeCombo,
): Promise<void> {
  await page.emulateMedia({ colorScheme: combo.os });
  await page.addInitScript((viewer) => {
    // The showcase ThemeService reads `extended-pdf-viewer-theme` first and
    // mirrors it into the viewer's own `ngx-extended-pdf-viewer.theme` key.
    // Seed both so neither the app shell nor the viewer falls back to the OS.
    localStorage.setItem('extended-pdf-viewer-theme', viewer);
    localStorage.setItem('ngx-extended-pdf-viewer.theme', viewer);
  }, combo.viewer);
}

// ─── contrast audit ─────────────────────────────────────────────────────────

export interface ContrastFailure {
  kind: 'text' | 'icon';
  label: string;
  fg: string;
  bg: string;
  ratio: number;
  selector: string;
}

export interface AuditOptions {
  /** Minimum WCAG contrast ratio. 3.0 catches "invisible" (~1.0) text/icons. */
  min?: number;
  /**
   * Selectors to ignore. Intentionally low-contrast bits (disabled buttons,
   * placeholders, decorative separators) live here so they don't false-positive.
   */
  ignore?: string[];
}

const DEFAULT_IGNORE = [
  '[disabled]',
  '[aria-disabled="true"]',
  '.treeItemToggler', // chevron, no text of its own
  '.toolbarButtonSpacer',
  '.verticalToolbarSeparator',
  '.splitToolbarButtonSeparator',
];

/**
 * Scan every visible text element and toolbar icon inside `scopeSelector` and
 * return the ones whose contrast against their real (composited) background is
 * below `min`. An empty array means the surface is readable.
 */
export async function auditContrast(
  page: Page,
  scopeSelector: string,
  options: AuditOptions = {},
): Promise<ContrastFailure[]> {
  const min = options.min ?? 3.0;
  const ignore = [...DEFAULT_IGNORE, ...(options.ignore ?? [])];

  return page.evaluate(
    ({ scopeSelector, ignore, min }) => {
      type RGBA = { r: number; g: number; b: number; a: number };

      const parse = (c: string): RGBA | null => {
        const m = c && c.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
      };
      // composite `fg` (with alpha) over an opaque `bg`
      const over = (fg: RGBA, bg: RGBA): RGBA => ({
        r: fg.r * fg.a + bg.r * (1 - fg.a),
        g: fg.g * fg.a + bg.g * (1 - fg.a),
        b: fg.b * fg.a + bg.b * (1 - fg.a),
        a: 1,
      });
      const lum = ({ r, g, b }: RGBA): number => {
        const f = (v: number) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const ratio = (a: RGBA, b: RGBA): number => {
        const L1 = lum(a);
        const L2 = lum(b);
        return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      };

      // The opaque background actually behind `el`: walk to the outermost
      // ancestor with an opaque background, then composite the translucent
      // layers between it and `el` back down. Falls back to white.
      const WHITE: RGBA = { r: 255, g: 255, b: 255, a: 1 };
      const bgBehind = (el: Element): RGBA => {
        const chain: Element[] = [];
        let n: Element | null = el;
        while (n) {
          chain.push(n);
          n = n.parentElement;
        }
        let baseIdx = chain.length - 1;
        let acc = WHITE;
        for (let i = chain.length - 1; i >= 0; i--) {
          const c = parse(getComputedStyle(chain[i]).backgroundColor);
          if (c && c.a >= 0.999) {
            baseIdx = i;
            acc = c;
            break;
          }
        }
        for (let j = baseIdx - 1; j >= 0; j--) {
          const c = parse(getComputedStyle(chain[j]).backgroundColor);
          if (c && c.a > 0) acc = over(c, acc);
        }
        return acc;
      };

      const visible = (el: Element): boolean => {
        const s = getComputedStyle(el);
        if (s.visibility === 'hidden' || s.display === 'none') return false;
        if (Number(s.opacity) === 0) return false;
        const r = el.getBoundingClientRect();
        return r.width >= 2 && r.height >= 2;
      };

      const selectorOf = (el: Element): string => {
        if (el.id) return '#' + el.id;
        const cls = String((el as HTMLElement).className || '')
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .join('.');
        return el.tagName.toLowerCase() + (cls ? '.' + cls : '');
      };

      const fmt = (c: RGBA): string =>
        `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`;

      const roots = Array.from(document.querySelectorAll(scopeSelector));
      const failures: Array<{
        kind: 'text' | 'icon';
        label: string;
        fg: string;
        bg: string;
        ratio: number;
        selector: string;
      }> = [];

      const seen = new Set<Element>();
      for (const root of roots) {
        const els = [root, ...Array.from(root.querySelectorAll('*'))];
        for (const el of els) {
          if (seen.has(el)) continue;
          seen.add(el);
          if (ignore.some((sel) => el.closest(sel))) continue;
          if (!visible(el)) continue;
          const cs = getComputedStyle(el);

          // (1) elements that directly own visible text
          const ownText = Array.from(el.childNodes)
            .filter((nd) => nd.nodeType === 3)
            .map((nd) => (nd.textContent || '').trim())
            .join('')
            .trim();
          if (ownText.length > 0) {
            const fg = parse(cs.color);
            if (fg && fg.a > 0.05) {
              const bg = bgBehind(el);
              const fgC = fg.a < 1 ? over(fg, bg) : fg;
              const rr = ratio(fgC, bg);
              if (rr < min) {
                failures.push({
                  kind: 'text',
                  label: ownText.slice(0, 40),
                  fg: cs.color,
                  bg: fmt(bg),
                  ratio: Math.round(rr * 100) / 100,
                  selector: selectorOf(el),
                });
              }
            }
          }

          // (2) mask-image icons (pdf.js draws them on ::before). The colour
          // that shows through the mask is the pseudo-element's background.
          for (const pseudo of ['::before', '::after']) {
            const ps = getComputedStyle(el, pseudo);
            const mask =
              (ps.maskImage && ps.maskImage !== 'none' && ps.maskImage) ||
              ((ps as unknown as { webkitMaskImage?: string }).webkitMaskImage ??
                'none');
            if (!mask || mask === 'none') continue;
            const iconColor = parse(ps.backgroundColor);
            if (!iconColor || iconColor.a <= 0.05) continue;
            const bg = bgBehind(el);
            const ic = iconColor.a < 1 ? over(iconColor, bg) : iconColor;
            const rr = ratio(ic, bg);
            if (rr < min) {
              failures.push({
                kind: 'icon',
                label: selectorOf(el) + ' ' + pseudo,
                fg: ps.backgroundColor,
                bg: fmt(bg),
                ratio: Math.round(rr * 100) / 100,
                selector: selectorOf(el),
              });
            }
          }
        }
      }
      return failures;
    },
    { scopeSelector, ignore, min },
  );
}

/**
 * Assert a surface is readable. On failure the message lists every offending
 * element with its colours and ratio, so the report says exactly what's wrong.
 */
export async function expectReadable(
  page: Page,
  scopeSelector: string,
  surface: string,
  options: AuditOptions = {},
): Promise<void> {
  const failures = await auditContrast(page, scopeSelector, options);
  // Soft so one unreadable surface doesn't hide the others — a single test run
  // reports every theming problem at once.
  expect.soft(
    failures,
    `${surface}: ${failures.length} low-contrast element(s)\n` +
      failures
        .map(
          (f) =>
            `  • [${f.kind}] "${f.label}" ${f.fg} on ${f.bg} = ${f.ratio}:1 (${f.selector})`,
        )
        .join('\n'),
  ).toEqual([]);
}

// ─── theme-direction invariant ──────────────────────────────────────────────

/** The effective (composited-over-white) background luminance of an element. */
export async function backgroundLuminance(
  page: Page,
  selector: string,
): Promise<number> {
  return page.evaluate((sel) => {
    type RGBA = { r: number; g: number; b: number; a: number };
    const parse = (c: string): RGBA | null => {
      const m = c && c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
    };
    const over = (fg: RGBA, bg: RGBA): RGBA => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    });
    const el = document.querySelector(sel);
    if (!el) return NaN;
    const chain: Element[] = [];
    let n: Element | null = el;
    while (n) {
      chain.push(n);
      n = n.parentElement;
    }
    let acc: RGBA = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = chain.length - 1; i >= 0; i--) {
      const c = parse(getComputedStyle(chain[i]).backgroundColor);
      if (c && c.a > 0) acc = over(c, acc);
    }
    const f = (v: number) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(acc.r) + 0.7152 * f(acc.g) + 0.0722 * f(acc.b);
  }, selector);
}

/**
 * Assert that `selector`'s background follows the *viewer* theme — dark theme ⇒
 * dark panel, light theme ⇒ light panel — independent of the emulated OS. This
 * is the direct regression guard for #3219.
 */
export async function expectThemeDirection(
  page: Page,
  selector: string,
  viewer: ViewerTheme,
  surface: string,
): Promise<void> {
  const L = await backgroundLuminance(page, selector);
  expect(Number.isNaN(L), `${surface}: ${selector} not found`).toBe(false);
  if (viewer === 'dark') {
    expect.soft(
      L,
      `${surface}: expected a DARK background for the dark viewer theme, got luminance ${L.toFixed(3)}`,
    ).toBeLessThan(0.35);
  } else {
    expect.soft(
      L,
      `${surface}: expected a LIGHT background for the light viewer theme, got luminance ${L.toFixed(3)}`,
    ).toBeGreaterThan(0.6);
  }
}
