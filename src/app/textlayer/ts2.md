```typescript
@Component({ ... })
export class TextlayerComponent {
  private alreadyRendered: Array<HTMLSpanElement> = [];

  private _showBoxes = false;

  public get showBoxes(): boolean {
    return this._showBoxes;
  }

  public set showBoxes(show: boolean) {
    if (show) {
      this.alreadyRendered.forEach((span) => {
        span.classList.add('box');
      });
    } else {
      this.alreadyRendered.forEach((span) => {
        span.classList.remove('box');
      });
    }
  }

  public highlightWords(event: TextLayerRenderedEvent): void {
    event.source.textDivs.forEach((span) => {
      this.alreadyRendered.push(span);
    });

    if (this.showTextLayer) {
      event.source.textDivs.forEach((span) => {
        span.classList.add('box');
      });
    }
}
```
