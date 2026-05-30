```html
<!-- The viewer is mounted inside a [hidden] block (not @if), so it
     genuinely initializes inside a display:none subtree. -->

<button (click)="activeTab = 'tab1'">Tab 1 (no viewer)</button>
<button (click)="activeTab = 'tab2'">Tab 2 (viewer with [page]="5")</button>

<div [hidden]="activeTab !== 'tab1'">
  <p>This tab is intentionally empty.</p>
</div>

<div [hidden]="activeTab !== 'tab2'">
  <ngx-extended-pdf-viewer
    [src]="'./assets/pdfs/sample.pdf'"
    [page]="5"
    [height]="'90vh'">
  </ngx-extended-pdf-viewer>
</div>
```
