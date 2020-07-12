```html
<ng-template #fancySidebar>
  <div id="sidebarContainer" style="top:31px;background-color:goldenrod">
    <div id="additionalSidebarContainer">
      <div id="toolbarSidebar">
        <div class="splitToolbarButton toggled">
          <button style="background-color: red; height:100%;width: 34%;border:0;margin:0;padding:0" 
            type="button" id="viewThumbnail" 
            class="toolbarButton" 
            data-l10n-id="thumbs">
            <span data-l10n-id="thumbs_label">Thumbnails</span>
          </button>
          <button
            style="background-color: green; height:100%;width: 35%;border:0;margin:0;padding:0"
            type="button"
            id="viewOutline"
            class="toolbarButton"
            data-l10n-id="document_outline">
            <span data-l10n-id="document_outline_label">Document Outline</span>
          </button>
          <button
            style="background-color: blue; height:100%;width: 34%;border:0;margin:0;padding:0"
            type="button" 
            id="viewAttachments" 
            class="toolbarButton" 
            data-l10n-id="attachments">
            <span data-l10n-id="attachments_label">Attachments</span>
          </button>
        </div>
      </div>
    </div>
    <pdf-sidebar-content></pdf-sidebar-content>
    <div id="sidebarResizer" class="hidden"></div>
  </div>
</ng-template>
```
