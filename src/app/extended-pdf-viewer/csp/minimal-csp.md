```
Content-Security-Policy:
  default-src 'self';
  script-src  'self';
  style-src   'self' 'unsafe-inline';
  img-src     'self' data: blob:;
  connect-src 'self' blob: data:;
  object-src  'none'
```

Measured against a fresh `ng new` + `ng add ngx-extended-pdf-viewer`
application - with `[useInlineScripts]="false"` - by loading a PDF and then
rendering, selecting text, opening the thumbnails, searching, printing and
downloading it, in Chromium and WebKit. No violation is left.

| Directive | Why the viewer needs it |
|---|---|
| `default-src 'self'` | The fallback for everything not listed below. It already covers `worker-src` (the PDF worker) and `font-src`, so neither needs a line of its own. |
| `script-src 'self'` | `viewer-*.mjs`, `pdf.worker-*.mjs` and `op-chaining-support.js` are ordinary files served by your own server. No `'unsafe-eval'` anywhere: pdf.js contains no `eval()` and no `new Function()`. |
| `style-src 'unsafe-inline'` | The viewer's stylesheet is injected as a `<style>` element. Without this the viewer does not render at all - it fails with *"The `container` must be absolutely positioned"*. Replace it with `'nonce-...'` if you can generate a nonce per response (see the *Nonce* tab). |
| `img-src data:` | The toolbar icons and the loading indicator of pdf.js are data URLs. |
| `img-src blob:` | Every page of a **printout** is handed to the browser as a Blob. Without it pdf.js falls back to data URLs - printing still works, but it uses noticeably more memory. |
| `connect-src blob: data:` | Only needed if you pass a Blob or a data URL as `[src]`. Without `blob:`, a Blob source fails to load outright ("Failed to fetch"). A plain same-origin URL is already covered by `default-src`. |
| `object-src 'none'` | Not needed by the viewer. It is in here because it costs nothing and is good practice. |

**Not needed**, although you will find them in many CSP examples:

- **`worker-src blob:`** - only if you load pdf.js from a *different origin* (a CDN);
  pdf.js then wraps the worker in a Blob to keep the origin.
- **`font-src data:`** - embedded fonts go through the `FontFace` API from a buffer,
  and pdf.js deliberately uses constructable stylesheets for the rest.
- **`'wasm-unsafe-eval'`** - optional. pdf.js decodes JBIG2 / JPEG2000 images with
  WebAssembly, which a CSP without this keyword blocks. pdf.js then loads the
  `*_nowasm_fallback.js` sibling automatically and renders the identical image, just
  more slowly. Add the keyword, or set `pdfDefaultOptions.useWasm = false` to skip the
  `.wasm` download that is going to fail.
- **`require-trusted-types-for` / `trusted-types`** - the library does not need Trusted
  Types. It only registers its `pdf-viewer` policy if *you* have switched them on.
