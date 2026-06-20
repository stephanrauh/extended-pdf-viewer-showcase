### How it works

The `annotationEditorEvent` reports the editor's rectangle in **normalized
coordinates**: `x`, `y`, `width` and `height` are fractions between `0` and `1`,
relative to the page and measured from the **top-left** corner. That is why they
look like "strange numbers below one".

You don't have to convert anything to screenshot the annotation:
`getPageAsCanvas()` (and `getPageAsImage()`) accept a `cropBox` argument in
exactly that coordinate system.

```typescript
import { NgxExtendedPdfViewerService, PdfPageCropBox } from 'ngx-extended-pdf-viewer';

private pdfViewerService = inject(NgxExtendedPdfViewerService);

private annotationRect: PdfPageCropBox | undefined;
private annotationPage: number | undefined;

public onAnnotationEditorEvent(event: any): void {
  // Read the rectangle from the live editor (event.source) - it always has the
  // *current* values. Don't rely on event.value: "sizeChanged" reports the rect
  // from *before* the resize, and a free-text box also changes size on
  // "fontSizeChanged" / "commit", which carry no rectangle at all. Refreshing on
  // every event (except "removed") keeps width/height in sync however the user
  // resized the annotation.
  if (event.type === 'removed') {
    return;
  }
  const editor = event.source;
  if (editor && typeof editor.x === 'number' && typeof editor.width === 'number') {
    this.annotationRect = {
      x: editor.x,           // all four are fractions between 0 and 1,
      y: editor.y,           // measured from the top-left corner of the page
      width: editor.width,
      height: editor.height,
    };
    this.annotationPage = event.page;
  }
}

public async screenshotAnnotation(): Promise<string | undefined> {
  if (!this.annotationRect || !this.annotationPage) {
    return undefined;
  }
  // Pass the normalized rectangle straight in as the cropBox - no maths needed.
  return this.pdfViewerService.getPageAsImage(
    this.annotationPage,
    { scale: 3 },          // render at 3x so the cropped thumbnail stays crisp
    undefined,             // background
    undefined,             // backgroundColorToReplace (keeps the default)
    undefined,             // annotationMode (keeps the default)
    this.annotationRect,   // <-- the cropBox
  );
}
```

> **Need PDF points instead of a screenshot?** The same normalized rectangle can
> be turned into PDF user-space coordinates (bottom-left origin) with
> `pdfPage.getViewport({ scale }).convertToViewportRectangle(...)`, or by calling
> `event.source.getRect(0, 0)`. See the **Coordinate systems** page for details.
