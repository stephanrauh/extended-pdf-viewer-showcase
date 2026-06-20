## The three coordinate systems

| System | Origin | Range / unit | Where you meet it |
|--------|--------|--------------|-------------------|
| **Normalized (page-relative)** | top-left | fractions `0 … 1` | annotation editor events, `cropBox`, the editor's live `x/y/width/height` |
| **PDF user space (points)** | bottom-left | points (1 pt = 1/72 inch) | `annotation.rect`, pdf-lib, `getRect()` |
| **Viewport / device pixels** | top-left | CSS / canvas pixels | the rendered canvas, screenshots, mouse events |

Mixing them up is the single most common cause of "my coordinates are wrong".

## 1. Normalized (page-relative) coordinates — the "numbers below one"

The annotation editors (highlight, ink/draw, free text, image stamp, signature)
store their position and size as **fractions of the page**:

- `x` &mdash; distance of the left edge from the left of the page, `0 … 1`
- `y` &mdash; distance of the top edge from the **top** of the page, `0 … 1`
- `width` &mdash; width as a fraction of the page width, `0 … 1`
- `height` &mdash; height as a fraction of the page height, `0 … 1`

So `{ x: 0, y: 0, width: 0.5, height: 0.5 }` is the upper-left quarter of the page.
These are the values you receive from the `annotationEditorEvent` output — that is
why they look "strange" and "below one". They are deliberately resolution- and
zoom-independent.

> **Heads-up on `sizeChanged`:** `event.value` holds the rectangle from *before*
> the resize. For the current rectangle, read it from the live editor:
> `event.source.x`, `.y`, `.width`, `.height`.

## 2. Normalized → canvas pixels

Because the canvas also uses a top-left origin, no flipping is needed —
just multiply by the canvas size:

```typescript
const pixelRect = {
  x: rect.x * canvas.width,
  y: rect.y * canvas.height,
  width: rect.width * canvas.width,
  height: rect.height * canvas.height,
};
```

You rarely need to do this by hand, though: `getPageAsCanvas()` and
`getPageAsImage()` accept a `cropBox` argument **in normalized coordinates**, so
you can hand an editor's rectangle straight in:

```typescript
import { NgxExtendedPdfViewerService, PdfPageCropBox } from 'ngx-extended-pdf-viewer';

const cropBox: PdfPageCropBox = { x, y, width, height }; // 0..1, from the event
const dataUrl = await service.getPageAsImage(pageNumber, { scale: 3 }, undefined, undefined, undefined, cropBox);
```

See the **EditorEvents → Screenshot annotation** tab for a complete, runnable demo.

## 3. Normalized → PDF user space (points)

PDF user space has its origin in the **bottom-left** corner and is measured in
points. Two ways to get there:

```typescript
// (a) Let the editor do it. getRect() returns [x1, y1, x2, y2] in PDF points.
const [x1, y1, x2, y2] = event.source.getRect(0, 0);

// (b) Do it yourself with the page's viewport (this is what the form-field
//     API and the "Adding arbitrary annotations" demo use internally):
const dpiRatio = 96 / 72;
const viewport = pdfPage.getViewport({ scale: dpiRatio });
const rectInPixels = viewport.convertToViewportRectangle(annotation.rect);
```

Remember the **Y axis flips** between PDF space (bottom-left) and the screen /
editor (top-left). If you build a PDF rectangle from a top-left `y`, convert it:

```typescript
const { width, height } = page.getSize(); // pdf-lib page size, in points
const pdfY = height - yFromTop;
```

## 4. Related demos

- [EditorEvents](/extended-pdf-viewer/editor-events) &mdash; the `annotationEditorEvent` and the screenshot tab
- [Export as image](/extended-pdf-viewer/export-image) &mdash; `getPageAsCanvas` / `getPageAsImage` and `cropBox`
- [Editor API (high level)](/extended-pdf-viewer/annotation-layer-api) &mdash; adding annotations programmatically
- [Adding arbitrary annotations](/extended-pdf-viewer/adding-arbitrary-annotations) &mdash; PDF user-space coordinates with pdf-lib
