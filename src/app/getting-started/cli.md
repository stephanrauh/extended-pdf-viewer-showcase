1. Open the file "angular.json" (or ".angular-cli.json" if you're using an older version of Angular)
   and add these three JavaScript files to the "scripts" section:

```json
"scripts": [
  "node_modules/ngx-extended-pdf-viewer/assets/pdf.js",
  "node_modules/ngx-extended-pdf-viewer/assets/pdf.worker.js",
  "node_modules/ngx-extended-pdf-viewer/assets/viewer.js"
]
```

If you're the adventurous one, you can also add the next version of pdf.js. Note that this version is a developer snapshat instead of a stable release. It's not intended to be used in production yet. Plus, the version number may change with each release of ngx-extended-pdf-viewer. That said, here's how to have a glimpse of the future:

```json
"scripts": [
  "node_modules/ngx-extended-pdf-viewer/assets/pdf-2.2.222.js",
  "node_modules/ngx-extended-pdf-viewer/assets/pdf.worker-2.2.222.js",
  "node_modules/ngx-extended-pdf-viewer/assets/viewer-2.2.222.js"
]
```

2. Add the translations to the assets by adding them to the "assets" section in the angular.json:

```json
"assets": [
  "src/favicon.ico",
  "src/assets",
  {
    "glob": "**/*",
    "input": "node_modules/ngx-extended-pdf-viewer/assets/locale",
    "output": "/assets/locale/"
  }
]
```

If you need only one language, you can reduce the list to 'locale.properties' and your language folder.

_Hint:_ There are two ways to define the language files needed for the labels of the buttons and screen elements of the PDF viewer. The second method is described below in the "internationalization" section.
