```html
<ng-template #checkboxThumbnail>
  <a class="pdf-viewer-template">
    <div class="thumbnail" data-page-number="PAGE_NUMBER">
      <input id="thumbnail-cbx-$page"
        class="thumbnail-checkbox"
        type="checkbox"
        style="top: 80px;right: 25px;position: relative;transform:scale(1.5)"
        onClick="window.PDFViewerApplication.page=PAGE_NUMBER;window.updateThumbnailSelection(PAGE_NUMBER)">
      <div class="thumbnailSelectionRing image-container" style="width: WIDTH_OF_RING; height: HEIGHT_OF_RING; display: contents">
        <!-- image is automatically inserted here -->
        <!-- <img class="thumbnailImage" style="width: 98px; height: 73px;" /> -->
      </div>
    </div>
  </a>
</ng-template>
```
