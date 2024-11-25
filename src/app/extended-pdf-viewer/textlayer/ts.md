```typescript
@Component({
standalone: false,  ... })
export class TextlayerComponent {
  private _showTextLayer = false;

  public get showTextLayer(): boolean {
    return this._showTextLayer;
  }

  public set showTextLayer(layer: boolean) {
    this._showTextLayer = layer;
    const divs = document.getElementsByClassName('textLayer');
    for (let i = 0; i < divs.length; i++) {
      const div = divs.item(i);
      if (layer) {
        div.classList.add('show-text-layer');
      } else {
        div.classList.remove('show-text-layer');
      }
    }
  }

  public highlightWords(event: TextLayerRenderedEvent): void {
    if (this.showTextLayer) {
      event.source.textDivs.forEach((span) => {
        span.classList.add('box');
      });
    }
  }
}
```
