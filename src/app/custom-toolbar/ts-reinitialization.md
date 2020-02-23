This demo changes the theme dynamically. The PDF viewer has to be re-initialized to support this feature. This is a prototypical sourcecode to achieve this:

```typescript
@Component({ ... })
export class CustomToolbarComponent {
  public _theme = 'findbar';

  @ViewChild('pdfViewer')
  public pdfViewer: OnInit & OnDestroy;

  public set theme(theme: string) {
    if (this._theme !== theme) {
      this.pdfViewer.ngOnDestroy();
      this._theme = theme;
      this.pdfViewer.ngOnInit();
    } else {
      this._theme = theme;
    }
  }

  public get theme(): string {
    return this._theme;
  }
}
```
