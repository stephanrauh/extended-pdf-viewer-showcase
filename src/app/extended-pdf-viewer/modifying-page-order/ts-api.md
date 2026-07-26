```typescript
import { Component, inject } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';

@Component({ ... })
export class ModifyingPageOrderComponent {
  private pdfService = inject(NgxExtendedPdfViewerService);

  // Put another PDF file in front of the document.
  // insertAfterPage counts from 1, so 0 means "before the first page".
  public async prependDocument(): Promise<void> {
    await this.pdfService.mergeDocument('/assets/pdfs/cover.pdf', { insertAfterPage: 0 });
  }

  // Omit insertAfterPage to append the pages at the end.
  public async appendDocument(): Promise<void> {
    await this.pdfService.mergeDocument('/assets/pdfs/appendix.pdf');
  }

  // Take only some pages of the other file, and insert them after the page
  // the user is looking at. includePages counts from 1 and accepts ranges.
  public async insertSomePages(): Promise<void> {
    await this.pdfService.mergeDocument('/assets/pdfs/appendix.pdf', {
      insertAfterPage: this.pdfService.getCurrentPage(),
      includePages: [1, [4, 8]],
      // excludePages: [5],
      // password: 'secret',      // if the added file is encrypted
    });
  }

  // Anything the user picks in a file dialog: PDF files and images alike.
  // Several sources are inserted in the order you pass them in.
  public async mergeSelectedFiles(event: Event): Promise<void> {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    await this.pdfService.mergeDocument(files, { insertAfterPage: 0 });
  }

  // Remove pages by page number. Single numbers and ranges, counting from 1.
  // Unlike the sidebar's delete button, this cannot be undone.
  public async deleteSomePages(): Promise<void> {
    await this.pdfService.deletePages([1, [8, 10]]);
  }

  // The escape hatch: pdf.js's own page descriptions, passed through unchanged.
  // Careful - these indexes count from 0, and insertAfter: -1 means "before everything".
  public async advanced(bytes: Uint8Array): Promise<void> {
    await this.pdfService.extractPages([
      { document: null, excludePages: [2] },        // the document on screen, minus page 3
      { document: bytes, insertAfter: -1 },         // another file, in front of it
    ]);
  }

  // The file on the server is never modified. Grab the result like this:
  public async save(): Promise<Blob | undefined> {
    return this.pdfService.getCurrentDocumentAsBlob();
  }
}
```

All of these replace the document on screen and resolve once the new document has
been rendered. They throw an `Error` with an explanatory message when the viewer
isn't ready, when a source can't be loaded, or when you try to delete every page.

Requires ngx-extended-pdf-viewer 29 (pdf.js 6.0 or newer). Merging pages is still an
experimental feature of pdf.js, so the details may change in a future version.
