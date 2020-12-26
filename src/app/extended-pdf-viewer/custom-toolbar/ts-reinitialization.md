The PDF viewer doesn't restart reliably when you change the theme. So this demo hides the PDF viewer before changing the theme.

```typescript
@Component({ ... })
export class CustomToolbarComponent {
  public _theme = 'findbar';

  public showPdfViewer = true;

  public set theme(theme: string) {
    if (this._theme !== theme) {
      this.showPdfViewer = false;
      this._theme = theme;
      setTimeout(() => this.showPdfViewer = true, 100);
    } else {
      this._theme = theme;
    }
  }

  public get theme(): string {
    return this._theme;
  }
}
```
