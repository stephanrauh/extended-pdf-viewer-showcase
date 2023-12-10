```html
<ngx-extended-pdf-viewer *ngIf="!hidden"
  [src]="'/assets/pdfs/blind-text-collection.pdf'"
  [height]="'90vh'"
  (pageRendered)="afterPageRendered($event)"
>
</ngx-extended-pdf-viewer>
```
