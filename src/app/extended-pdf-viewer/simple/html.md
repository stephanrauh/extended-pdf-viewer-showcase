```html
 <ngx-extended-pdf-viewer
     [src]="'/assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf'"
     [height]="'90vh'" <!-- by default, most CSS frameworks set the height to 0 -->
     [useBrowserLocale]="true" <!-- load i18n files from the assets folder -->
     [textLayer]="true" <!-- enable the find button -->
     [showHandToolButton]="true"> <!-- enable text selection -->
</ngx-extended-pdf-viewer>
```
