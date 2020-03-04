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
