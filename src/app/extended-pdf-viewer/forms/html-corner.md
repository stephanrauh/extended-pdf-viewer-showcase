```html
<ngx-extended-pdf-viewer
  [src]="'/assets/pdfs/OoPdfFormExample.pdf'"
  [formData]="formData"
  (formDataChange)="setFormData($event)"
  (pageRendered)="delayedUpdateFormData()"
>
</ngx-extended-pdf-viewer>
```
