1. Open the file "angular.json" (or ".angular-cli.json" if you're using an older version of Angular)
   and add these three JavaScript files to the "scripts" section:

```json
"scripts": [
  "node_modules/ngx-extended-pdf-viewer/assets/pdf.js",
  "node_modules/ngx-extended-pdf-viewer/assets/viewer.js"
]
```

If need to support Internet Explorer 11, use these files instead:

```json
"scripts": [
  "node_modules/ngx-extended-pdf-viewer/assets/pdf-es5.js",
  "node_modules/ngx-extended-pdf-viewer/assets/viewer-es5.js"
]
```

2. Add the translations and images to the assets by adding them to the "assets" section in the angular.json:

```json
"assets": [
  "src/favicon.ico",
  "src/assets",
  {
    "glob": "**/*",
    "input": "node_modules/ngx-extended-pdf-viewer/assets/locale",
    "output": "/assets/locale/"
  },
    {
    "glob": "**/*",
    "input": "node_modules/ngx-extended-pdf-viewer/assets/images",
    "output": "/assets/images/"
  },
  { 
    "glob": "**/pdf.worker.js", 
    "input": "node_modules/ngx-extended-pdf-viewer/ngx-extended-pdf-viewer/assets", 
    "output": "/assets/" 
  }
]
```

If you need only one language, you can reduce the list to 'locale.properties' and your language folder.

_Hint:_ There are two ways to define the language files needed for the labels of the buttons and screen elements of the PDF viewer. The second method is described below in the "internationalization" section.
