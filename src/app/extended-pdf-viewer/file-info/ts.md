```typescript
 @Component({...})
export class FileInfoComponent {
  public fileInfo: PdfDocumentInfo;

  public onPagesLoaded() {
    new PdfDocumentPropertiesExtractor().getDocumentProperties().then((result) => this.fileInfo = result);
  }
}
```
