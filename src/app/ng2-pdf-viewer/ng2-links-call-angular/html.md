```html
<pdf-viewer *ngIf="!hidden"
            [src]="'/assets/pdfs/blind-text-collection.pdf'"
            [render-text]="true"
            [page]="1"
            [show-all]="false"
            [external-link-target]="target"
            style="width: 100%; height: 100%">
</pdf-viewer>
```
