# Complete Implementation Examples

## Page Reordering Example

```typescript
import { Component, inject, AfterViewInit } from '@angular/core';
import { NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
  template: `
    <ngx-extended-pdf-viewer
      [showMovePageButton]="true"
      src="assets/sample.pdf">
    </ngx-extended-pdf-viewer>
    <div>
      <button (click)="movePageUp()">Move Current Page Up</button>
      <button (click)="movePageDown()">Move Current Page Down</button>
      <button (click)="printDocument()">Print</button>
      <button (click)="downloadDocument()">Download</button>
    </div>
  `
})
export class MyComponent implements AfterViewInit {
  private pdfService = inject(NgxExtendedPdfViewerService);
  
  constructor() {
    pdfDefaultOptions.enablePageReordering = true;
  }
  
  ngAfterViewInit() {
    // Service is ready to use
  }
  
  movePageUp() {
    const currentPage = this.pdfService.getCurrentPage();
    if (currentPage > 1) {
      this.pdfService.movePage(currentPage, currentPage - 1);
    }
  }
  
  movePageDown() {
    const currentPage = this.pdfService.getCurrentPage();
    const totalPages = this.pdfService.getPageCount();
    if (currentPage < totalPages) {
      this.pdfService.movePage(currentPage, currentPage + 1);
    }
  }
  
  printDocument() {
    this.pdfService.print();
  }
  
  downloadDocument() {
    this.pdfService.download();
  }
}
```

## Search Example

```typescript
import { Component, inject, AfterViewInit } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';

@Component({
  template: `
    <ngx-extended-pdf-viewer src="assets/sample.pdf"></ngx-extended-pdf-viewer>
    <div>
      <input #searchInput type="text" placeholder="Search text">
      <button (click)="search(searchInput.value)">Search</button>
      <button (click)="findNext()">Next</button>
      <button (click)="findPrevious()">Previous</button>
    </div>
  `
})
export class SearchComponent implements AfterViewInit {
  private pdfService = inject(NgxExtendedPdfViewerService);
  
  ngAfterViewInit() {
    // Service is ready to use
  }
  
  search(text: string) {
    if (text.trim()) {
      this.pdfService.find(text, {
        highlightAll: true,
        matchCase: false
      });
    }
  }
  
  findNext() {
    this.pdfService.findNext();
  }
  
  findPrevious() {
    this.pdfService.findPrevious();
  }
}
```

## Best Practices

### Service Injection
Always inject `NgxExtendedPdfViewerService` into your component constructor and wait for the viewer to initialize before calling service methods.

### Error Handling
Wrap service calls in try-catch blocks when appropriate, especially for async operations.

### Feature Dependencies
Some methods require specific features to be enabled (e.g., `enablePageReordering` for `movePage`).

### Timing
Use `ngAfterViewInit()` or later lifecycle hooks to ensure the PDF viewer is ready before calling service methods.