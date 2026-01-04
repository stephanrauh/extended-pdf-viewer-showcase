```typescript
import { Component, ChangeDetectorRef } from '@angular/core';
import { NgScrollbarExt, NgScrollbarAsyncViewport } from 'ngx-scrollbar';

@Component({
  selector: 'app-custom-scrollbar',
  templateUrl: './custom-scrollbar.component.html',
  styleUrls: ['./custom-scrollbar.component.css'],
  standalone: true,
  imports: [NgScrollbarExt, NgScrollbarAsyncViewport, NgxExtendedPdfViewerModule]
})
export class CustomScrollbarComponent {
  constructor(private cdr: ChangeDetectorRef) {}

  public pdfReady = false;

  public onPagesLoaded(): void {
    // asyncViewport="auto" handles waiting for the element
    requestAnimationFrame(() => {
      this.pdfReady = true;
      this.cdr.detectChanges();
    });
  }
}
```

**Important notes:**
- **Import both `NgScrollbarExt` and `NgScrollbarAsyncViewport`**: The `asyncViewport` attribute requires the `NgScrollbarAsyncViewport` directive to be imported. This is a separate directive that works together with `NgScrollbarExt`.
- **Use `asyncViewport="auto"`**: This tells ngx-scrollbar to automatically poll for the viewport element to become available, eliminating race conditions with pdf.js's asynchronous DOM building.
- **Use `(pagesLoaded)` instead of `(pdfLoaded)`**: The `pagesLoaded` event fires after the viewer DOM structure is built, making `#viewerContainer` reliably available.
- **Simple and clean**: No manual initialization, no element verification, no ViewChild needed - `asyncViewport` handles everything automatically.
- Call `ChangeDetectorRef.detectChanges()` after setting `pdfReady = true` to prevent Angular's ExpressionChangedAfterItHasBeenCheckedError.
- **Auto-updating**: ngx-scrollbar uses ResizeObserver by default to automatically detect size changes.
