```html
<pdf-viewer *ngIf="!hidden"
            [src]="'/assets/pdfs/blind-text-collection.pdf'"
            [render-text]="true"
            [page]="1"
            [show-all]="false"
            [external-link-target]="target">
</pdf-viewer>
```
