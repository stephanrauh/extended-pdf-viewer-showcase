```html
<ng-template #radiobuttonThumbnail>
  <a class="pdf-viewer-template">
    <div class="thumbnail" data-page-number="PAGE_NUMBER">
        <input id="thumbnail-cbx-$page"
        class="thumbnail-radiobutton"
        type="radiobutton"
        style="top: 80px;right: 25px;position: relative;transform:scale(1.5)"
        onClick="window.PDFViewerApplication.page=PAGE_NUMBER;window.updateThumbnailSelection(PAGE_NUMBER)">
        <div class="thumbnailSelectionRing" style="width: WIDTH_OF_RING; height: HEIGHT_OF_RING; display: contents">
          <div class="thumbnail-text" style="width: WIDTH_OF_RING; height: HEIGHT_OF_RING;margin-bottom: -HEIGHT_OF_RING">
          </div>
          <div class="image-container">
            <!-- image is automatically inserted here -->
        </div>
      </div>
    </div>
  </a>
</ng-template>
```
