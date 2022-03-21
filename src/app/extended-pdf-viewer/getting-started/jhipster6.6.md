**Caveat**: I don't support non-standard installations. This includes JHipster. Nonetheless, I've collected some hint that might help you get the PDF viewer up and running.

**Hint**: There's a demo repository featuring JHipster 6.6 and ngx-extended-pdf-viewer 2.0.0-alpha.0 at
<a target="#" href="https://github.com/stephanrauh/PDF-Hipster">https://github.com/stephanrauh/PDF-Hipster</a>.

Locate the `CopyWebpackPlugin` in the file `webpack.common.js` (currently line 66-75) and add this line:

```javascript
new CopyWebpackPlugin([
  { from: "./node_modules/ngx-extended-pdf-viewer/assets", to: 'assets' },
  ...
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

_Hint:_ If you are using JHipster, note there's no `assets` folder, so most likely the path of the URL is something like `[src]="'content/example.pdf'"`.
