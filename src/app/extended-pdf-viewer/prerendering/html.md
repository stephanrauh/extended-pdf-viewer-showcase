```html
 <ngx-extended-pdf-viewer
    [src]="'./assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf'"
    [zoom]="'page-width'"
    [height]="'auto'"
    [(page)]="page"
    [(pageLabel)]="pageLabel"
    [textLayer]="true"
    (pageRendered)="onPageRendered()">
    </ngx-extended-pdf-viewer>
```
