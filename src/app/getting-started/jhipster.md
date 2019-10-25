1. Locate the `CopyWebpackPlugin` in the file `webpack.common.js` (currently line 70) and add this line:

```javascript
new CopyWebpackPlugin([
  { from: "./node_modules/ngx-extended-pdf-viewer/assets/locale", to: 'content/assets/locale' },
```

2. Copy the files `node_modules/ngx-extended-pdf-viewer/assets/pdf.worker.js` and `node_modules/ngx-extended-pdf-viewer/assets/pdf.js` manually to `src/main/webcontent/app`.

3. Copy the file `node_modules/ngx-extended-pdf-viewer/assets/viewer.js` manually to a new folder `src/main/webcontent/app/web`.

4. Add these lines to the imports section of the `app.main.ts` file:

```typescript
require('ngx-extended-pdf-viewer/assets/pdf.js');
require('ngx-extended-pdf-viewer/assets/pdf.worker*.js');
require('ngx-extended-pdf-viewer/assets/web/viewer.js');
```

5. Open the freshly copied pdf.js file, locate the function `webpackUniversalModuleDefinition()` and replace the first ten lines by this version:

```typescript
(function webpackUniversalModuleDefinition(root, factory) {
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if(typeof define === 'function' && define.amd)
    define("pdfjs-dist/build/pdf", [], factory);
  else if(typeof exports === 'object')
    exports["pdfjs-dist/build/pdf"] = factory();
  // else <-- delete line
  window["pdfjs-dist/build/pdf"] = root["pdfjs-dist/build/pdf"] = root.pdfjsLib = factory(); // <-- modified line
})(this, function() {
```
