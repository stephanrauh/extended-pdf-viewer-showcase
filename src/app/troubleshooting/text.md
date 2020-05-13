# Troubleshooting

## Loading the JS file in the wrong order

Have a look at [this discussion](https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/20). Several developers observed it's a good idea to load the three pdf.js files before any other additional JavaScript file. Plus, they use each other, so they need to be defined in this order:

```json
"scripts": [
  "node_modules/ngx-extended-pdf-viewer/assets/pdf.js",
  "node_modules/ngx-extended-pdf-viewer/assets/viewer.js",
  (put any additional JavaScript file here)
]
```

There's a third file - `node_modules/ngx-extended-pdf-viewer/assets/pdf.worker.js`. Earlier versions of these instructions told you to put add it in the `scripts` section, too, but that's wrong, as you'll see in the next paragraph.


## Fake worker
If you see the message "Setting up fake worker", everything works fine, except you're wasting performance. To avoid that, make sure that the file `pdf.worker.js` (or `pdf.worker-es5.js` for developers supporting IE11) is *not* part of the `scripts` section of the `angular.json`.

Instead, put the pdf.worker.js file into the assets folder. The path can be configured in the global constant `defaultOptions.workerSrc` (which, in turn, is defined in the file `default-options.ts`). By default, it's './assets/pdf.worker.js'. In other words, you need to add these lines to the `angular.json`:

```json
"assets": [
   ...,
   {
      "glob": "pdf.worker.js", // or "pdf.worker-es5.js" to support IE11
      "input": "node_modules/ngx-extended-pdf-viewer/assets",
      "output": "/assets/"
   }
```

If you need IE11 support, you also need to configure the URL of the worker file:

```typescript
import { defaultOptions } from 'ngx-extended-pdf-viewer';

@Component(...)
export class PdfDisplayComponent {
constructor() {
    defaultOptions.workerSrc = './assets/pdf.worker-es5.js';
  }
```

If everything works, the file is lazy-loaded when the PDF viewer opens, and you're rewarded with a non-blocking PDF viewer, even if your PDF file is huge.

## Trouble with printing (aka: compatibility to Bootstrap and other CSS frameworks)

Bootstrap interferes with the printing algorithm of `pdf.js`. Guard it with a media query to avoid unwanted effects, such as scaling the print to 65%. For example, if you're using SCSS and Bootstrap 4, remove the import of Bootstrap.min.css from the Angular.json file. Instead, import it by including Bootstrap by adding this line to the global `styles.scss` file:

```css
@media screen {
  @import '../node_modules/bootstrap/scss/bootstrap';
}
```
Caveat: this trick only works with the SCSS version of both `styles.scss` and `bootstrap.scss`. It doesn't work with simple CSS. If you're using pure CSS, you can use the solution suggested by <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/48#issuecomment-596629621" target="#">Austin Walker</a>:

```css
@media print {
  body {
    min-width: auto !important;
  }
}
```

If you need more information, have a look at these issues:
* https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/148
* https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/175
* https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/143 

## Promise.allSettled is not a function

Please update the library `zone.js` to a current version. At the time of writing, that's 0.10.3. For some reason, the default setup of Angular locks `zone.js` to an old version. In most cases, the update shouldn't cause problems.

## Localization

Did you set the attribute `useBrowserLocale`? By default, it's false. Usually, it's better to set it to true. The pdf viewer uses the language the user has set in their browser settings and loads a translation file from the assets folder. If that doesn't work, please check the settings in the Angular.json file.

If you've set `useBrowserLocale="false"`, you need to define the translations in the `index.html`. The folder `node_modules/ngx-extended-pdf-viewer/assets/inline-locale-files` contains snippet files you can simply copy into your HTML page.

_Hint_: Sometimes you do not need to copy the HTML snippet into the index.html at the root folder of the Angular project. The bottom line is that the HTML snippet is already part of the DOM when the PDF viewer is initialized. Cluttering the root index file with the translations is an ugly and inflexible hack, but it works.

## Marking a search result
The PDF viewer has three different rendering modes. By default, `ngx-extended-pdf-viewer` does not render the "text layer". Most of the time, you won't notice - apart from improved performance. However, without the text layer, you can't mark text, and the "find" function doesn't highlight the search results.

To activate the text layer, use `showHandToolButton="true"`.

## set delayFirstView="1000" (deprecated)

This workaround was needed in the early version of ngx-extended-pdf-viewer, before I understood how to initialize the library correctly. However, it may come in handy every once in a while. Sometimes the initialization of the pdf viewer takes some time, so the PDF file is opened too early. As a work-around, you can add a delay. Setting it to one second is usually a good compromise:

```html
<ngx-extended-pdf-viewer src="..." useBrowserLocale="true" [delayFirstView]="1000"></ngx-extended-pdf-viewer>
```

## Multiple PDF viewers on the same page (e.g. tabs)

Unfortunately, you can't use multiple instances of `<ngx-extended-pdf-viewer>` on the same page. You're restricted to a single PDF viewer. This also applies to hidden PDF viewers. If you're using tabs containing PDF files, make sure you hide the PDF viewer before showing the next tab. You'll also need a short delay before showing the new PDF viewer. It takes some time to remove every object from memory.

## Printing

The print algorithm often conflicts with your CSS framework. That's because the print algorithm simply generates images of each page, adds them to the document, hides everything else, and prints what's left. Basically, that's simply a list of `<div>` tags containing images. If you CSS framework influences the `<div>` or `<image>`, you end up with empty or truncated pages.

ngx-extended-pdf-viewer covers several popular CSS frameworks (such as BootsFaces and Material Design), but it's still possible there's a conflict I haven't seen yet. If so, checking the `display` and `overflow` properties is a good starting point. Often adding this CSS snippet solves the problem:

```css
@media print {
  #printContainer > div {
    display: inline;
    overflow-y: visible;
  }
}
```

## Other hints collected over time

| Error message or description                                            |                                                                                                                                                                                                                               Solution                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| "TypeError: Cannot read property 'setPagesCount' of null"               | The language files couldn't be loaded. If you're following the default approach, `useBrowserLocale="true"`. In any case, check whether the language files are part of your project and if they are loaded from the correct path. Note that there's no default translation. You have to load a language file for any language, including English. In rare cases the language files are loaded, just not in time. In this case increase the value of `delayFirstView`. |
| The browser locale is ignored.                                          |                                                                                                            The HTML snippets in the folder `node_modules/ngx-extended-pdf-viewer/assets/inline-locale-files` contain exactly one language. If you want to support multiple language, you have to add the additional languages to the Json data structure.                                                                                                            |
| sticky toolbar (when scrolling, the pdf file appears above the toolbar) |                                                                      This happens if you're using the z-index to position the `<ngx-extended-pdf-viewer>`. If you can't avoid to do so, add the global CSS rule `.body .toolbar { z-index: 0; }`. The PDF viewer works without the z-index of the toolbar. The only difference is that the shadow of the toolbar is hidden by the PDF document.                                                                      |
| Print also includes UI elements                                         |                                                              Usually, the entire screen is hidden automatically, but sometimes this fails, especially with widgets that are dynamically added, such as error messages, progress bars, and block UI overlays. Use media queries to hide the unwanted UI elements. For example, use something like `@media print { #modal-error-dialog: display none; }`.                                                              |
