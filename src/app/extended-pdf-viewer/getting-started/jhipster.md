**Caveat**: I don't support non-standard installations. This includes JHipster. Nonetheless, I've collected some hint that might help you get the PDF viewer up and running.

1. Locate the `CopyWebpackPlugin` in the file `webpack.common.js` (currently line 70) and add this line:

```javascript
new CopyWebpackPlugin([
  { from: "./node_modules/ngx-extended-pdf-viewer/assets/locale", to: 'content/assets/locale' },
```

2. Copy the files 
  - `node_modules/ngx-extended-pdf-viewer/assets/pdf.worker.min.js` and 
  - `node_modules/ngx-extended-pdf-viewer/assets/pdf.min.js` 
  manually to `src/main/webcontent/app`.

3. Copy the file `node_modules/ngx-extended-pdf-viewer/assets/viewer.min.js` manually to a new folder `src/main/webcontent/app/web`.

4. Add these lines to the imports section of the `app.main.ts` file:

```typescript
require('ngx-extended-pdf-viewer/assets/pdf.min.js');
require('ngx-extended-pdf-viewer/assets/pdf.worker.min.js');
require('ngx-extended-pdf-viewer/assets/web/viewer.min.js');
```

5. If you want to support Internet Explorer 11 and some other older browsers, also copy the ES5 version of these files:
  - `node_modules/ngx-extended-pdf-viewer/assets/pdf.worker-es5.min.js` and 
  - `node_modules/ngx-extended-pdf-viewer/assets/pdf-es5.min.js` 
  - `node_modules/ngx-extended-pdf-viewer/assets/viewer-es5.min.js`

6. If you need to debug the PDF viewer, you may want to use the non-minified versions of these files: `pdf.worker.js`, `pdf.js`, and `viewer.js`.

7. Open the freshly copied pdf.js file, locate the function `webpackUniversalModuleDefinition()` and replace the first ten lines by this version:

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
