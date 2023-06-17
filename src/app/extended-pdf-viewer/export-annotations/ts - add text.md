```typescript
 public addTextEditor(): void {
  const textEditorAnnotation: FreeTextEditorAnnotation = {
    annotationType: 3,
    color: [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)],
    fontSize: Math.random() * 10 + 20,
    value: 'Hello world!',
    pageIndex: 0,
    rect: [
      50, // height?
      Math.random() * 500 + 350, // y
      Math.random() * 400, // x
      100, // width?
    ],
    rotation: 0,
  };
  this.pdfViewerService.addEditorAnnotation(textEditorAnnotation);
}
```
