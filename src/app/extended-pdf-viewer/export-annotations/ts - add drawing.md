```typescript
public async addDrawing(): Promise<void> {
  const x = 400*Math.random();
  const y = 350+500*Math.random();
  const drawing: InkEditorAnnotation = {
    annotationType: 15,
    color: [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)],
    thickness: Math.random()*10,
    opacity: 1,
    paths: [
      {
        bezier: [x+0.5, y, x+0.5, y+44, x+44, y+66, x+88, y+44],
        points: [x+0.5, y, x+0.5, y+44],
      },
    ],
    pageIndex: 0,
    rect: [x, y, x+100, y+66],
    rotation: 0,
  };
  await this.pdfViewerService.addEditorAnnotation(drawing);
}
```
