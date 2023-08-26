```typescript
public onAnnotationLayerRendered(event: AnnotationLayerRenderedEvent): void {
  const copyrightHint = event.source.div.querySelector('.freeTextAnnotation');
  if (copyrightHint && copyrightHint instanceof HTMLElement) {
    copyrightHint.style.left="20%";
    const canvas = copyrightHint.querySelector("canvas");
    if (canvas) {
        canvas.style.width="75%";
        canvas.style.height="75%";
        canvas.style.top="20px";
        canvas.style.left="10%";
    }
  }
}
```
