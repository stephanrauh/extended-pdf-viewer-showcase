```typescript
@Component({
standalone: false,  ... })
export class MultipleDocumentsComponent {
  public src = 'assets/pdfs/pdf-sample.pdf';

  public url = new URL('http://pdfviewer.net/assets/pdfs/GraalVM.pdf');

  public dragAndDrop = true;
}
```
