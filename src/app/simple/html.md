```html
<ngx-extended-pdf-viewer
    [src]="'assets/pdfs/pdf-sample.pdf'"
    [useBrowserLocale]="true" <!-- load i18n files from the assets folder -->
    [textLayer]="true" <!-- enable the find button -->
    [showHandToolButton]="true" <!-- enable text selection -->
    [height]="'90vh'"> <!-- by default, most CSS framework set the height to 0 -->
</ngx-extended-pdf-viewer>
```
