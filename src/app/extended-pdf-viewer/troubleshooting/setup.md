# Setup and installation

## Which version do I need for my Angular version?

ngx-extended-pdf-viewer supports the last four Angular versions, roughly two years of updates. The current versions require Angular 19, 20, 21, or 22. If you're stuck with Angular 17 or 18, use version 25.6.4.

The library works with both zone.js and zoneless Angular. In zoneless applications, you'll have to call `cdr.markForCheck()` every once in a while.

## Start with a configuration that works

This PDF viewer requires some configuration, and that has driven many good developers nuts. So check if `<ngx-extended-pdf-viewer>` works on your machine first. Either use the schematics described on the <a href="/extended-pdf-viewer/getting-started">getting started page</a> to create a fresh project within a few minutes, or clone this showcase:

```bash
git clone https://github.com/stephanrauh/extended-pdf-viewer-showcase.git
npm install
npm start
```

If that works and your application doesn't, compare the two configurations.

## The assets folder

The viewer needs the JavaScript files of pdf.js, the CMap files, the fonts, and the translations. They are expected in the assets folder of your application. The <a href="/extended-pdf-viewer/getting-started">getting started page</a> shows the `angular.json` configuration that copies them from `node_modules/ngx-extended-pdf-viewer/assets`. If you're using a different build system (e.g. JHipster with webpack), copy the folder with the tools of that build system.

## Running Angular in a context path or using a non-standard assets folder

Sometimes the path resolution fails. In this case, set the default option `assetsFolder` to the appropriate value. Maybe you'll even have to modify the derived options `workerSrc` and `cMapUrl`. See <a href="/extended-pdf-viewer/options">the default options</a>.

Since version 28.0.0-rc.8 (#3209), the derived options `workerSrc`, `cMapUrl`, `standardFontDataUrl`, and `sandboxBundleSrc` resolve their relative paths against `document.baseURI`, so a `<base href>` tag is applied exactly once. If you are on an older version and see a mangled worker URL with a duplicated context-path segment &mdash; for example `https://appserver/crossdomainproxy//crossdomainproxy/../pdf.worker-x.y.z.min.mjs` &mdash; set `workerSrc` to an absolute URL yourself:

```ts
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

// `href` is the absolute base of your assets, e.g. document.baseURI + 'assets/'
pdfDefaultOptions.workerSrc = () => href + 'pdf.worker-x.y.z.min.mjs';
```

## Don't load the worker yourself ("Setting up fake worker")

Don't add `pdf.worker-*.mjs` or `viewer-*.mjs` to the `scripts` section of your `angular.json`. The library loads these files itself, and it chooses between the modern and the legacy build depending on your user's browser.

Technically, loading `pdf.worker-*.mjs` yourself works, and with small PDF files you won't notice a difference. But pdf.js then can't start its web worker. Instead, it parses the PDF file in the main thread of your application, logging "Setting up fake worker". That's slow: one of our <a href="https://www.obwb.ca/library/okanagan-basin-waterscape-poster/">test PDF files (75 MB!)</a> shows almost immediately in the default configuration, but takes several minutes with a fake worker.

## The viewer isn't shown in my language

Check the network tab of the developer tools. The translations are part of the assets folder (`assets/locale`). If you only support a few languages, you can omit the other language files. That reduces the size of the installation, but it doesn't improve performance.

The attribute `[language]` is only read when the viewer is drawn initially. To switch to another language, remove the viewer from the DOM and draw it again. The <a href="/extended-pdf-viewer/i18n">i18n demo</a> shows how to do this, and how to modify a translation.

## My CSS stopped working after upgrading to version 30

Since version 30, the viewer no longer writes to your `<html>` tag. If you style the viewer from the outside with selectors like `html[dir='rtl'] ngx-extended-pdf-viewer .toolbarButton`, switch to `ngx-extended-pdf-viewer .body[dir='rtl'] .toolbarButton`. If you read `--viewer-container-height`, `--viewsManager-width` or `color-scheme` from `document.documentElement`, they now live on the viewer's own `.html` element. Custom templates passed via `[customPdfViewer]` must keep the `.html` and `.body` wrappers around `#outerContainer`.

## Content Security Policy

The viewer runs with a strict CSP, but it needs a few settings, such as `[useInlineScripts]="false"`. The <a href="/extended-pdf-viewer/csp">CSP demo</a> describes a minimal policy and what happens if you omit `'wasm-unsafe-eval'`.

## Loading PDF files from another server or behind a login

- If the PDF file is on another server, that server must send CORS headers. See <a href="/extended-pdf-viewer/range-requests">range requests</a>.
- If the server requires authentication, use `[authorization]` or `[httpHeaders]`. Note that `[authorization]` doesn't add the "Bearer " prefix for you. See <a href="/extended-pdf-viewer/keycloak">Keycloak</a>.
