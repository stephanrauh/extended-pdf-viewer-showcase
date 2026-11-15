```typescript
public removeEditors(): void {
  this.pdfViewerService.removeEditorAnnotations();
}

public removeTextEditors(): void {
  const filter = (serial: any) => 
    serial?.annotationType === 3 && 
    serial?.pageIndex === 0;
  this.pdfViewerService.removeEditorAnnotations(filter);
}

public removeDrawingEditors(): void {
  const filter = (serial: any) => serial.annotationType === 15;
  this.pdfViewerService.removeEditorAnnotations(filter);
}
```

```typescript
// Match your own stable id, e.g. after restoring annotations with addEditorAnnotation()
public removeEditorsWithCustomId(): void {
  const filter = (serial: any) => serial?.customId !== undefined;
  this.pdfViewerService.removeEditorAnnotations(filter);
}
```
