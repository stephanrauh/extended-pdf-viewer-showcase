```html
<span *ngFor="let layer of layers">
  <button *ngIf="layer.visible" mat-button mat-raised-button 
          color="primary" 
          (click)="toggle(layer.layerId)">
    toggle {{ layer.name }}
  </button>
  <button *ngIf="!layer.visible" mat-button mat-stroked-button 
          color="primary" 
          (click)="toggle(layer.layerId)">
    toggle {{ layer.name }}
  </button>
</span>
```
