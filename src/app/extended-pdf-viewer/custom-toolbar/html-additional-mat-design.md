You can also nest your custom HTML inside a `<pdf-shy-button>`. The option has been introduced with version 22.2.0 - it's possible that it's not perfect yet.
```html
<ng-template #additionalButtons>
      ...
      <pdf-shy-button
        [cssClass]="'lg' | responsiveCSSClass"
        title="export an image"
        primaryToolbarId="nestedComponent"
        [order]="1"
        [closeOnClick]="true"
      >
        <button #nestedContent
          id="sidebarToggle"
          color="primary"
          class="toolbarButton"
          matTooltip="export an image"
          (click)="exportAsImage()"
        >
        <mat-icon style="color: #FF0000;">photo_camera</mat-icon>
      </button>
    </pdf-shy-button>
    ...
</ng-template>
```
