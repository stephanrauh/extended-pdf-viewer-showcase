```typescript
@Component({ ... })
export class NavigationComponent {
  public _namedDest: string | undefined;
  public page: number | undefined;

  public get namedDest() {
    return this._namedDest;
  }

  public set namedDest(dest: string | undefined) {
    // reset the attribute to force change detection:
    this._namedDest = undefined;
    setTimeout(() => (this._namedDest = dest));
  }
}
```
