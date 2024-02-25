```typescript
public addImage() {
  const x = 496;
  const y = 386;
  const stampAnnotation: any = {
    annotationType: 13,
    pageIndex: 2,
    bitmapUrl: 'data:image/png;base64,iVB......',
    rect: [
      x,
      y,
      x + 128,
      y + 32
    ],
    rotation: 0,
  }
  this.pdfService.addEditorAnnotation(stampAnnotation);
}
```
