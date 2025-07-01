```html
<div class="pdf-container">
  <div *ngIf="showLoadingIndicator() || hasError()" class="loading-overlay">
    <div *ngIf="!hasError()" class="spinner"></div>
    <div *ngIf="hasError()" class="error-icon">⚠️</div>
    <p>{{ loadingMessage() }}</p>
  </div>
  <ngx-extended-pdf-viewer
    [src]="src"
    (pdfLoaded)="onPdfLoaded()"
    (pdfLoadingFailed)="onPdfLoadingFailed()"
    (pdfLoading)="onPdfLoading()"
    (pageRendered)="onPageRendered()"
    (pageRender)="onPageRender()">
  </ngx-extended-pdf-viewer>
</div>
```
