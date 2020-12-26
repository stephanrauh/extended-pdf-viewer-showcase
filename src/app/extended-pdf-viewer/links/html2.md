```html
<ngx-extended-pdf-viewer *ngIf="!hidden"
  [src]="'/assets/pdfs/blind-text-collection.pdf'"
  [height]="'90vh'"
  [useBrowserLocale]="true"
  (pageRendered)="afterPageRendered($event)"
>
</ngx-extended-pdf-viewer>
```
