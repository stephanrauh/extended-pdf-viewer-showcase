```html
<!-- The API needs no attribute at all: inject NgxExtendedPdfViewerService
     and call it. [enableMerge] only adds the "Add file" button for your users. -->
<ngx-extended-pdf-viewer
  [src]="'/assets/pdfs/ngx-extended-pdf-viewer-flyer.pdf'"
  [sidebarVisible]="true">
</ngx-extended-pdf-viewer>

<button (click)="prependDocument()">Add a PDF before page 1</button>
<button (click)="deleteSomePages()">Delete pages</button>

<label>
  Add your own file
  <input type="file" accept="application/pdf,image/*" multiple
         (change)="mergeSelectedFiles($event)" />
</label>
```
