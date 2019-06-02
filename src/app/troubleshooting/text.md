# Troubleshooting

## Loading the JS file in the wrong order

Have a look at [this discussion](https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/20). Several developers observed it's a good idea to load the three pdf.js files before any other additional JavaScript file. Plus, they use each other, so they need to be defined in this order:

```json
"scripts": [
  "node_modules/ngx-extended-pdf-viewer/assets/pdf.js",
  "node_modules/ngx-extended-pdf-viewer/assets/pdf.worker.js",
  "node_modules/ngx-extended-pdf-viewer/assets/viewer.js",
  (put any additional JavaScript file here)
]
```

## Localization

Did you set the attribute `useBrowserLocale`? By default, it's false. Usually, it's better to set it to true. The pdf viewer uses the language the user has set in their browser settings and loads a translation file from the assets folder. If that doesn't work, please check the settings in the Angular.json file.

If you've set `useBrowserLocale="false"`, you need to define the translations in the `index.html`. The folder `node_modules/ngx-extended-pdf-viewer/assets/inline-locale-files` contains snippet files you can simply copy into your HTML page.

_Hint_: Sometimes you do not need to copy the HTML snippet into the index.html at the root folder of the Angular project. The bottom line is that the HTML snippet is already part of the DOM when the PDF viewer is initialized. Cluttering the root index file with the translations is an ugly and inflexible hack, but it works.

## set `delayFirstView="1000"`

Strictly speaking, this is only a work-around. Sometime the initialization of the pdf viewer takes some time, and I haven't found out when to open the PDF file. As a work-around, you can add a delay. Setting it to one second is usually a good compromise:

```html
<ngx-extended-pdf-viewer src="..." useBrowserLocale="true" [delayFirstView]="1000"></ngx-extended-pdf-viewer>
```

## Other hints collected over time

| Error message or description                                            |                                                                                                                                                                                                                               Solution                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| "TypeError: Cannot read property 'setPagesCount' of null"               | The language files couldn't be loaded. If you're following the default approach, `useBrowserLocale="true"`. In any case, check whether the language files are part of your project and if they are loaded from the correct path. Note that there's no default translation. You have to load a language file for any language, including English. In rare cases the language files are loaded, just not in time. In this case increase the value of `delayFirstView`. |
| The browser locale is ignored.                                          |                                                                                                            The HTML snippets in the folder `node_modules/ngx-extended-pdf-viewer/assets/inline-locale-files` contain exactly one language. If you want to support multiple language, you have to add the additional languages to the Json data structure.                                                                                                            |
| sticky toolbar (when scrolling, the pdf file appears above the toolbar) |                                                                      This happens if you're using the z-index to position the `<ngx-extended-pdf-viewer>`. If you can't avoid to do so, add the global CSS rule `.body .toolbar { z-index: 0; }`. The PDF viewer works without the z-index of the toolbar. The only difference is that the shadow of the toolbar is hidden by the PDF document.                                                                      |
| Print also includes UI elements                                         |                                                              Usually, the entire screen is hidden automatically, but sometimes this fails, especially with widgets that are dynamically added, such as error messages, progress bars, and block UI overlays. Use media queries to hide the unwanted UI elements. For example, use something like `@media print { #modal-error-dialog: display none; }`.                                                              |
