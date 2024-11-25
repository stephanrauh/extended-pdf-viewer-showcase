```typescript
 @Component({
standalone: false, ...})
export class FileInfoComponent {
  public fileInfo: PdfDocumentInfo;

  public onPagesLoaded() {
    new PdfDocumentPropertiesExtractor().getDocumentProperties().then((result) => this.fileInfo = result);
  }
}
```
