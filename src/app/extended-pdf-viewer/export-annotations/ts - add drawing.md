```typescript
public async addDrawing(): Promise<void> {
  const x = 400 * Math.random();
  const y = 350 + 500 * Math.random();
  const thickness = 5 + Math.random() * 5; // Thickness between 5-10
  const drawing: InkEditorAnnotation = {
    annotationType: 15,
    color: [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)],
    thickness: thickness,
    opacity: 1,
    paths: {
      // Bezier curves - create a gentle wave with properly calculated control points
      lines: [
        [NaN, NaN, NaN, NaN, x, y,
         x + 10, y + 15, x + 20, y + 25, x + 30, y + 20,
         x + 40, y + 15, x + 50, y + 25, x + 60, y + 20]
      ],
      // Raw points of the path
      points: [
        [x, y, x + 30, y + 20, x + 60, y + 20]
      ]
    },
    pageIndex: 0,
    // Note: rect is recalculated during deserialization, so this value is mostly ignored
    rect: [x, y, x + 60, y + 25],
    rotation: 0,
  };
  await this.pdfViewerService.addEditorAnnotation(drawing);
}
```
