Install the library with `npm install`:

```batch
npm i ngx-extended-pdf-viewer --save
```

Next, open the file `angular.json` (or `.angular-cli.json` if you're using an older version of Angular) and configure Angular to copy the `assets` folder of the library into the `assets` folder of your application:

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

You can choose between the stable release of pdf.js or the "bleeding edge" version. That latter is a version I regularly update with the newest changes from the Mozilla team. But be warned, the developer version is bleeding edge. It's a far cry from being a thoroughly tested release. The automated tests at Mozilla are fairly good, but it's always possible I do a mistake when merging the changes.

If you want to use the "bleeding edge" version of pdf.js, add these lines:

```json
  "assets": [
    "src/favicon.ico",
    "src/assets",
    {
      "glob": "**/*",
      "input": "node_modules/ngx-extended-pdf-viewer/bleeding-edge/",
      "output": "/bleeding-edge/"
    }
  ],
  "scripts": []
```


You will also need to add those lines to your component : 
1. An import statement
```ts
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
```
2. A line in your constructor
```ts 
pdfDefaultOptions.assetsFolder = 'bleeding-edge';
```

## Almost there!

Add `NgxExtendedPdfViewerModule` to the import section of your module file. If your IDE doesn't find
    the import automatically, here it is:

```typescript
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
```

Now you can display the PDF file like so:

```html
<ngx-extended-pdf-viewer [src]="'assets/example.pdf'" [useBrowserLocale]="true"></ngx-extended-pdf-viewer>
```
