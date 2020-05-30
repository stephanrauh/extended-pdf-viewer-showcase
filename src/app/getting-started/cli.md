Open the file `angular.json` (or `.angular-cli.json` if you're using an older version of Angular) and configure Angular to copy the `assets` folder of the library into the `assets` folder of your application:

```json
  "assets": [
    "src/favicon.ico",
    "src/assets",
    {
      "glob": "**/*",
      "input": "node_modules/ngx-extended-pdf-viewer/assets/",
      "output": "/assets/"
    }
  ],
  "scripts": []
```

This simply copies the entire assets folder. If you're concerned about disk memory, you can omit the subfolders `inline-locale-files` and `additional-locale`. If you need only one language, you can reduce the list to `locale.properties` and your language folder.

_Hint:_ There are two ways to define the language files needed for the labels of the buttons and screen elements of the PDF viewer. The second method is described below in the "internationalization" section.

The next version of pdf.js, 2.5, hasn't been released yet. However, the current developer snapshot already fixes at least one bug ([#285](https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/285)). But be warned, the developer version is bleeding edge. It's a far cry from being a thoroughly tested release. 

If you want to use the developer version 2.5 of pdf.js, add these lines:

```json
  "assets": [
    "src/favicon.ico",
    "src/assets",
    {
      "glob": "**/*",
      "input": "node_modules/ngx-extended-pdf-viewer/assets/",
      "output": "/assets/"
    },
    {
      "glob": "**/*",
      "input": "node_modules/ngx-extended-pdf-viewer/assets-2.5/",
      "output": "/assets/"
    }
  ],
  "scripts": []
  
