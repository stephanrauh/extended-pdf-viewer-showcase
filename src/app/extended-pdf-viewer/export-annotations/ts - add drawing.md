```typescript
public addDrawing(): void {
  const x = 400*Math.random();
  const y = 350+500*Math.random();
  const drawing: InkEditorAnnotation = {
    annotationType: 15,
    color: [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)],
    thickness: Math.random()*10,
    opacity: 1,
    paths: [
      {
        bezier: [0.5, 14, 0.5, 44, 44, 66, 88, 44],
        points: [0.5, 14, 0.5, 44],
      },
    ],
    pageIndex: 0,
    rect: [x, y, x+100, y+100],
    rotation: 0,
  };
  this.pdfViewerService.addEditorAnnotation(drawing);
}
```
