```html
<ngx-extended-pdf-viewer
    [src]="'/assets/pdfs/blind-text-collection.pdf'"
    [textLayer]="true" <!-- enable the find button -->
    [showHandToolButton]="true" <!-- enable text selection -->
    [flattenOnDownload]="flatten" <!-- Version 32, bleeding edge only: false, true or 'non-forms' -->
    [height]="'90vh'"> <!-- by default, most CSS frameworks set the height to 0 -->
</ngx-extended-pdf-viewer>
```
