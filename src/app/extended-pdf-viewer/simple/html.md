```html
 <ngx-extended-pdf-viewer
     [src]="'/assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf'"
     [height]="'auto'" <!-- you can also use %, px and vh, or omit the attribute altogether -->
     [textLayer]="true" <!-- enable the find button -->
     [showHandToolButton]="true" <!-- enable text selection -->
     [filenameForDownload]="'Public Domain.pdf'"> <!-- optional - define the filename if the user downloads the PDF -->
</ngx-extended-pdf-viewer>
```
