```html
 <ngx-extended-pdf-viewer
     [src]="'/assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf'"
     [useBrowserLocale]="true" <!-- load i18n files from the assets folder -->
     [textLayer]="true" <!-- enable the find button -->
     [showHandToolButton]="true" <!-- enable text selection -->
     [showPresentationModeButton]="true"
     [(page)]="page"
     [(pageLabel)]="pageLabel">
</ngx-extended-pdf-viewer>
```
