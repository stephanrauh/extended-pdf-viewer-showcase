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
// Give an annotation your own stable id when you add (or restore) it...
public async addTextEditorWithCustomId(): Promise<void> {
  const customId = `my-note-${++this.customIdCounter}`;
  await this.pdfViewerService.addEditorAnnotation({
    annotationType: 3,
    color: [0, 0, 255],
    fontSize: 20,
    value: `customId: ${customId}`,
    pageIndex: 0,
    rect: [50, 500, 250, 535],
    rotation: 0,
    customId,
  });
}

// ...and the filter of removeEditorAnnotations() sees it (since 32.0.2, #3271)
public removeEditorsWithCustomId(): void {
  const filter = (serial: any) => serial?.customId !== undefined;
  this.pdfViewerService.removeEditorAnnotations(filter);
}

// or remove a single one: (serial: any) => serial?.customId === 'my-note-1'
```
