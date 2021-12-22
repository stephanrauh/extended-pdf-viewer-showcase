**Caveat**: I don't support non-standard installations. This includes JHipster. Nonetheless, I've collected some hint that might help you get the PDF viewer up and running.

**Hint**: There's a demo repository featuring JHipster 6.6 and ngx-extended-pdf-viewer 2.0.0-alpha.0 at
<a target="#" href="https://github.com/stephanrauh/PDF-Hipster">https://github.com/stephanrauh/PDF-Hipster</a>.

Locate the `CopyWebpackPlugin` in the file `webpack.common.js` (currently line 66-75) and add this line:

```javascript
new CopyWebpackPlugin([
  { from: "./node_modules/ngx-extended-pdf-viewer/assets", to: 'assets' },
  ...
```
