```html
<div class="pdf-host">
  <ngx-extended-pdf-viewer
    [src]="'/assets/pdfs/BootsFaces_Deep_Dive_1.0.pdf'"
    (pagesLoaded)="onPagesLoaded()">
  </ngx-extended-pdf-viewer>

  @if (pdfReady) {
    <ng-scrollbar
      [externalViewport]="'#viewerContainer'"
      [externalContentWrapper]="'#viewer'"
      asyncViewport="auto"
      track="vertical"
      visibility="hover">
    </ng-scrollbar>
  }
</div>
```

**Key points:**
- Use `externalViewport="#viewerContainer"` to attach to pdf.js's scroll container
- Use `externalContentWrapper="#viewer"` to avoid injecting a wrapper into pdf.js DOM
- **Set `asyncViewport="auto"`**: This tells ngx-scrollbar to automatically poll for the viewport element to become available, eliminating race conditions with pdf.js's asynchronous DOM building
- **Use `(pagesLoaded)` event**: This fires after the viewer DOM is built, unlike `(pdfLoaded)` which fires earlier when just the PDF document is loaded
- **Auto-updating**: ngx-scrollbar uses ResizeObserver by default to automatically detect size changes - no manual `update()` calls needed!
- **Simple integration**: No manual initialization, element verification, or ViewChild needed - just set the inputs and let `asyncViewport` handle the timing
