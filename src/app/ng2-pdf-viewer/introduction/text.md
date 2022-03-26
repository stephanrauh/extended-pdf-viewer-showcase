## Prequisites

You need node.js, npm, and a current version of Angular. Install the library with `npm install`:

```batch
npm i ng2-pdf-viewer --save
```

Add the `PdfViewerModule` to your application module or to your feature module:

```typescript
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  imports: [BrowserModule, PdfViewerModule],
  ...
})
class AppModule {}
```

Now you can use the PDF viewer in your components:

```typescript
@Component({
  selector: 'example-app',
  template: `
  <pdf-viewer [src]="pdfSrc" 
              [render-text]="true"
              style="display: block;width: 100%; height: 100%"
  ></pdf-viewer>
  `
})
export class AppComponent {
  pdfSrc = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
}
```
