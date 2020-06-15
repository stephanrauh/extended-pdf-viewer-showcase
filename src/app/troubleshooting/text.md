# Troubleshooting

## Promise.allSettled is not a function

Please update the library `zone.js` to a current version. At the time of writing, that's 0.10.3. For some reason, the default setup of Angular locks `zone.js` to an old version. In most cases, the update shouldn't cause problems.

## I can't find the find button

First of all, I have to apologize: For some reason, I've never managed to make the  intuitive. I hope I'll manage one day or another!

The PDF viewer uses two layers of information. The first layer is what you see. That's simply an image. The second layer is the text layer. You need it to select text, and without the text layer you can't find anything. The "find" function can only cope with text, not with images.

To activate the "find" button you need a PDF file that contains text. A surprising number of PDF files are just images. If you've got such a PDF file, there's no find button. The PDF viewer doesn't include an OCR reader.

Second, you have to activate the attribute `textlayer`:

```html
<ngx-extended-pdf-viewer
     [textLayer]="true"  <!-- necessary to activate the find button and the select tool -->
     [showHandToolButton]="true" <!-- displays the "select tool" and the "hand tool" buttons -->
     [src]="'assets/pdfs/blind-text-collection.pdf'"
     [height]="'90vh'"
     [useBrowserLocale]="true">
  </ngx-extended-pdf-viewer>
```

## I can't select text

That's mostly the same as the trouble with the find button. Activate the text layer, set `[showHandToolButton]="true"`, use a PDF file containing text, and you're good to go. That's an annoyingly long list of conditions. Sorry for that!

## When I select or find text, the selection is slightly off

The text layer doesn't match the real positions of the text. It's a good approximation, but it's not perfect. More often than not, the selection is half a character off, sometimes even more. There's nothing you can do about it - except offering your help at the base project, <a href="https://github.com/mozilla/pdf.js">pdf.js</a>. The project support almost every language and every font of the world, so it's hard to get it right.

## Why is the text layer deactivated by default?

The PDF viewer is a lot faster if it doesn't have to render the text layer. That's why you have to activate the text layer manually.

## Trouble with printing (aka: compatibility to Bootstrap and other CSS frameworks)

Broken print is the most popular reason to open a bug tracker issue. Almost always the problems are caused by your CSS framework. Thing is, the PDF viewer doesn't really print anything. It just hides the entire page using CSS and adds high-resolution images to the document. After that, the PDF viewer simply calls the print function of your browser. Basically, it's printing the entire HTML page. Your custom CSS is still active. If it reduces the font size, you end up with scaled-down pages in print.

ngx-extended-pdf-viewer covers several popular CSS frameworks (such as BootsFaces and Material Design), but it's still possible there's a conflict I haven't seen yet. If so, checking the `display` and `overflow` properties is a good starting point. Often adding this CSS snippet solves the problem:

```css
@media print {
  #printContainer > div {
    display: inline;
    overflow-y: visible;
  }
}
```

### Possibly outdated hint: printing with Bootstrap

As far as I remember, I've managed to solve this bug for you. But if you're using an older version of ngx-extended-pdf-viewer, the bug might still hit you. Bootstrap interferes with the printing algorithm of `pdf.js`. Guard it with a media query to avoid unwanted effects, such as scaling the print to 65%. For example, if you're using SCSS and Bootstrap 4, remove the import of Bootstrap.min.css from the Angular.json file. Instead, import it by including Bootstrap by adding this line to the global `styles.scss` file:

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

### Dig deeper

If you need more information, have a look at these issues:
* https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/148
* https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/175
* https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/143 


## Localization

Did you set the attribute `useBrowserLocale`? By default, it's false. Usually, it's better to set it to true. The pdf viewer uses the language the user has set in their browser settings and loads a translation file from the assets folder. If that doesn't work, please check the settings in the Angular.json file.

If you've set `useBrowserLocale="false"`, you need to define the translations in the `index.html`. The folder `node_modules/ngx-extended-pdf-viewer/assets/inline-locale-files` contains snippet files you can simply copy into your HTML page.

_Hint_: Sometimes you do not need to copy the HTML snippet into the index.html at the root folder of the Angular project. The bottom line is that the HTML snippet is already part of the DOM when the PDF viewer is initialized. Cluttering the root index file with the translations is an ugly and inflexible hack, but it works.

## Multiple PDF viewers on the same page (e.g. tabs)

Unfortunately, you can't use multiple instances of `<ngx-extended-pdf-viewer>` on the same page. You're restricted to a single PDF viewer. This also applies to hidden PDF viewers. If you're using tabs containing PDF files, make sure you hide the PDF viewer before showing the next tab. You'll also need a short delay before showing the new PDF viewer. It takes some time to remove every object from memory.

## Other hints collected over time

| Error message or description                                            |                                                                                                                                                                                                                               Solution                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| "TypeError: Cannot read property 'setPagesCount' of null"               | The language files couldn't be loaded. If you're following the default approach, `useBrowserLocale="true"`. In any case, check whether the language files are part of your project and if they are loaded from the correct path. Note that there's no default translation. You have to load a language file for any language, including English. In rare cases the language files are loaded, just not in time. In this case increase the value of `delayFirstView`. |
| The browser locale is ignored.                                          |                                                                                                            The HTML snippets in the folder `node_modules/ngx-extended-pdf-viewer/assets/inline-locale-files` contain exactly one language. If you want to support multiple language, you have to add the additional languages to the Json data structure.                                                                                                            |
| sticky toolbar (when scrolling, the pdf file appears above the toolbar) |                                                                      This happens if you're using the z-index to position the `<ngx-extended-pdf-viewer>`. If you can't avoid to do so, add the global CSS rule `.body .toolbar { z-index: 0; }`. The PDF viewer works without the z-index of the toolbar. The only difference is that the shadow of the toolbar is hidden by the PDF document.                                                                      |
| Print also includes UI elements                                         |                                                              Usually, the entire screen is hidden automatically, but sometimes this fails, especially with widgets that are dynamically added, such as error messages, progress bars, and block UI overlays. Use media queries to hide the unwanted UI elements. For example, use something like `@media print { #modal-error-dialog: display none; }`.                                                              |

# Hint referring to old versions of ngx-extended-pdf-viewer

Using the PDF viewer has become a lot simpler over time. However, if you're using a pre 2.0 version, or if you've got a non-standard configuration, these hints may be useful to you.

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

## set delayFirstView="1000" (deprecated)

This workaround was needed in the early version of ngx-extended-pdf-viewer, before I understood how to initialize the library correctly. However, it may come in handy every once in a while. Sometimes the initialization of the pdf viewer takes some time, so the PDF file is opened too early. As a work-around, you can add a delay. Setting it to one second is usually a good compromise:

```html
<ngx-extended-pdf-viewer src="..." useBrowserLocale="true" [delayFirstView]="1000"></ngx-extended-pdf-viewer>
```
