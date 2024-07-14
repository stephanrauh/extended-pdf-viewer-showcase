```html
<ng-template #radiobuttonThumbnail>
  <a class="pdf-viewer-template">
    <div class="thumbnail" data-page-number="PAGE_NUMBER" style="border: none">
      <input id="thumbnail-cbx-PAGE_NUMBER" data-page-number="PAGE_NUMBER" class="thumbnail-radiobutton" type="radio" style="top: 100px; right: 25px; position: relative; transform: scale(1.5)" />
      <div class="thumbnail-text"></div>
      <div class="image-container" style="width: var(--thumbnail-width); height: var(--thumbnail-height)">
        <img class="thumbnailImage" />
      </div>
      <div style="margin-top: -30px;margin-left: auto;margin-right: auto;text-align: center;width: 25px;height: 25px;border-radius: 50%;background-color: blue;
          color: white;line-height: 25px;">
        #PAGE_NUMBER
      </div>
    </div>
  </a>
</ng-template>
```
