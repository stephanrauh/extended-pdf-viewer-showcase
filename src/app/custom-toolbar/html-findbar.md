```html
<ngx-extended-pdf-viewer
  #pdfViewer
  [customFindbarInputArea]="customFindbarInputArea"
  [customFindbarButtons]="customFindbarButtons"
  [src]="'assets/pdfs/dachstein.pdf'"
  [height]="'50vh'"
  [useBrowserLocale]="true"
  [textLayer]="true">
</ngx-extended-pdf-viewer>

<ng-template #customFindbarInputArea>
  <div id="findbarInputContainer">
    <pdf-search-input-field></pdf-search-input-field>
    <br />
    <pdf-find-previous></pdf-find-previous>
    <pdf-find-next></pdf-find-next>
  </div>
</ng-template>

<ng-template #customFindbarButtons>
  <pdf-find-input-area [customFindbarInputArea]="customFindbarInputArea"></pdf-find-input-area>
  <div id="findbarOptionsOneContainer">
    <pdf-find-highlight-all></pdf-find-highlight-all>
    <pdf-find-match-case></pdf-find-match-case>
  </div>
  <br />
  <div id="findbarOptionsTwoContainer">
    <pdf-find-entire-word></pdf-find-entire-word>
    <pdf-find-entire-phrase></pdf-find-entire-phrase>
  </div>
  <br />
  <div id="findbarOptionsThreeContainer">
    <pdf-find-ignore-accents></pdf-find-ignore-accents>
    <pdf-find-results-count></pdf-find-results-count>
  </div>
  <br />
  <pdf-findbar-message-container></pdf-findbar-message-container>
</ng-template>
```
