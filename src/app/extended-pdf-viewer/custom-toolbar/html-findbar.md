```html
<ngx-extended-pdf-viewer
  #pdfViewer
  [customFindbarInputArea]="customFindbarInputArea"
  [customFindbarButtons]="customFindbarButtons"
  [src]="'/assets/pdfs/dachstein.pdf'"
</ngx-extended-pdf-viewer>

<ng-template #customFindbarInputArea>
  <div id="findbarInputContainer">
    <pdf-search-input-field></pdf-search-input-field>
  </div>
</ng-template>

<ng-template #customFindbarButtons>
  <div class="no-float">
    <pdf-find-input-area [customFindbarInputArea]="customFindbarInputArea"></pdf-find-input-area>
  </div>
  <div class="no-float">
    <pdf-find-highlight-all></pdf-find-highlight-all>
    <pdf-find-match-case></pdf-find-match-case>
    <pdf-find-entire-word></pdf-find-entire-word>
    <pdf-find-results-count></pdf-find-results-count>
    <pdf-findbar-message-container></pdf-findbar-message-container>
    <pdf-find-previous></pdf-find-previous>
    <pdf-find-next></pdf-find-next>
  </div>
</ng-template>
```
