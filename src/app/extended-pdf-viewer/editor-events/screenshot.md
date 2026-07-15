### How it works

The `annotationEditorEvent` gives you the live editor as `event.source`. To
screenshot the annotation, read its **`normalizedPageRect`** and hand it straight
to `getPageAsCanvas()` (or `getPageAsImage()`) as the `cropBox` — no maths needed.

`normalizedPageRect` is a rectangle in **normalized coordinates**: `x`, `y`,
`width` and `height` are fractions between `0` and `1`, measured from the
**top-left** corner of the page. That is why they look like "strange numbers
below one". It is the exact coordinate system the `cropBox` expects.

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
  if (editor && editor.normalizedPageRect) {
    // normalizedPageRect is already a { x, y, width, height } cropBox.
    this.annotationRect = editor.normalizedPageRect;
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
    undefined,             // annotationMode (keeps the default, see below)
    this.annotationRect,   // <-- the cropBox
  );
}
```

### Why `normalizedPageRect`, and not `editor.x` / `editor.y`?

The editor also exposes raw `x`, `y`, `width` and `height`, and for an annotation
added on an **un-rotated** page they happen to equal `normalizedPageRect`. But
those raw values are stored in whatever rotation the page had **when the
annotation was added**:

- for 90° / 270°, the width and height are **swapped** (the on-screen axes, not
  the page's), and
- `y` is the annotation's **bottom** edge, not its top.

So if you rotate the page, then add a stamp, then screenshot it, the raw values
crop the wrong region entirely. `normalizedPageRect` converts them back into the
page's un-rotated frame for you, so it always describes the same physical area no
matter how the page was rotated. Always use it for a `cropBox`.

### The screenshot is WYSIWYG

- **Editor annotations are included.** `getPageAsCanvas()` / `getPageAsImage()`
  default to `annotationMode: AnnotationMode.ENABLE_STORAGE`, so an image stamp
  you just added (but haven't saved into the PDF yet) and current form-field
  values show up in the screenshot. Pass `AnnotationMode.ENABLE` if you only want
  the annotations already baked into the document.
- **Rotation is honoured.** A rotated page is captured in its on-screen
  orientation. To override that, pass a `rotation` (`0` | `90` | `180` | `270`)
  as the last argument — e.g. `0` always yields the page in its authored
  orientation regardless of how the user rotated it.

> **Need PDF points instead of a screenshot?** The same rectangle can be turned
> into PDF user-space coordinates (bottom-left origin) by calling
> `event.source.getRect(0, 0)`, or by applying the page viewport's `transform` to
> the rectangle yourself. (pdf.js 6.1 removed the former
> `viewport.convertToViewportRectangle(...)` helper.) See the **Coordinate
> systems** page for details.
