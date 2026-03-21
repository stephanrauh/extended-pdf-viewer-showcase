You can nest your custom HTML inside a `<pdf-shy-button>`. This way, your custom button shows up in the primary toolbar, and it's also automatically added to the secondary toolbar (the "hamburger menu" that appears on small screens).

The key points:
- Add `#nestedContent` to your custom button element
- Set `primaryToolbarId` to a unique ID
- Set `title` - this text is shown in the secondary toolbar
- Set `[cssClass]` to control when the button moves to the secondary toolbar
- Set `[order]` to control the button's position in the secondary toolbar
- The `[action]` input is not used for nested buttons. Use `(click)` on the nested button instead. Important: the onClick method must not rely on the `this` pointer.

```html
<ng-template #additionalButtons>
  <div id="toolbarViewer">
    <div id="toolbarViewerLeft">
      <pdf-toggle-sidebar></pdf-toggle-sidebar>
      <div class="toolbarButtonSpacer"></div>
      <pdf-paging-area></pdf-paging-area>
    </div>
    <pdf-zoom-toolbar></pdf-zoom-toolbar>
    <div id="toolbarViewerRight">
      <pdf-open-file></pdf-open-file>
      <pdf-presentation-mode></pdf-presentation-mode>
      <pdf-print></pdf-print>

      <!-- Custom nested button: appears in both primary and secondary toolbar -->
      <pdf-shy-button
        [cssClass]="'lg' | responsiveCSSClass"
        title="export an image"
        primaryToolbarId="exportAsImageButton"
        [order]="1"
        [closeOnClick]="true"
      >
        <button #nestedContent
          class="toolbarButton"
          title="export an image"
          (click)="exportAsImage()"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 15.2C13.77 ..." fill="currentColor"/>
            <path d="M9 2L7.17 4H4C2.9 ..." fill="currentColor"/>
          </svg>
        </button>
      </pdf-shy-button>

      <pdf-download></pdf-download>
      <pdf-toggle-secondary-toolbar></pdf-toggle-secondary-toolbar>
    </div>
  </div>
</ng-template>
```
