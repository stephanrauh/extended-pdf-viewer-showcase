```html
<ng-template #radiobuttonThumbnail>
  <a class="pdf-viewer-template">
    <div class="thumbnail" data-page-number="PAGE_NUMBER" style="border:none">
      <input id="thumbnail-cbx-PAGE_NUMBER"
        class="thumbnail-radiobutton"
        type="radio"
        style="top: 80px;right: 25px;position: relative;transform:scale(1.5)"
        onClick="window.updateThumbnailSelection(PAGE_NUMBER)">
      <div class="thumbnail-text" *ngIf="(pdfjsVersion>='3.7')">
      </div>
      <div class="image-container" 
           style="width: var(--thumbnail-width); height: var(--thumbnail-height);">
        <img class="thumbnailImage" />
      </div>
      <div style="margin-top: -20px; text-align: center; width: 20px;height: 20px; border-radius: 50%; background-color: blue; color: white; line-height: 20px">
        #PAGE_NUMBER
      </div>
    </div>
  </a>
</ng-template>
```
