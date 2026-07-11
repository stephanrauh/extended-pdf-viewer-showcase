```html
<ngx-extended-pdf-viewer
  [src]="'/assets/pdfs/ngx-extended-pdf-viewer-flyer.pdf'"
  [textLayer]="true"
  [customToolbar]="dragToolbar"
  (annotationEditorEvent)="onAnnotationEditorEvent($event)"
  (dblclick)="onViewerDoubleClick($event)"
>
</ngx-extended-pdf-viewer>

<!-- A custom toolbar carrying the extra "Drag / Paint" toggle button. -->
<ng-template #dragToolbar>
  <div id="toolbarViewer">
    <div id="toolbarViewerLeft">
      <pdf-toggle-sidebar></pdf-toggle-sidebar>
      <div class="toolbarButtonSpacer"></div>
      <pdf-paging-area></pdf-paging-area>
    </div>

    <pdf-zoom-toolbar></pdf-zoom-toolbar>

    <div id="toolbarViewerRight">
      <pdf-editor></pdf-editor>

      <!-- The custom drag/paint toggle. Same step as the double-click cycle. -->
      @if (state !== 'none') {
        <button
          type="button"
          class="toolbarButton"
          style="width: auto; padding: 0 10px; white-space: nowrap;"
          [style.background-color]="state === 'drag' ? '#2563eb' : ''"
          [style.color]="state === 'drag' ? '#fff' : ''"
          [attr.aria-pressed]="state === 'drag'"
          title="Drag mode: move/resize existing annotations without creating new ones"
          (click)="cycle()"
        >
          &#10021; {{ state === 'drag' ? 'Drag ON' : (state === 'paint' ? 'Paint' : 'Drag') }}
        </button>
      }

      <pdf-download></pdf-download>
      <pdf-toggle-secondary-toolbar></pdf-toggle-secondary-toolbar>
    </div>
  </div>
</ng-template>
```
