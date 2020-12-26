```typescript
@Component({ ... })
export class DisplayOptionsComponent {
  public showBorders = false;

  public backgroundColor = '#F8F8FD';

  private _scrollMode = ScrollModeType.horizontal;

  public get scrollMode(): ScrollModeType {
    return this._scrollMode;
  }

  public set scrollMode(mode: ScrollModeType) {
    this.ngZome.run(() => this._scrollMode = mode);
  }

  constructor(private ngZome: NgZone) {}
}
```
