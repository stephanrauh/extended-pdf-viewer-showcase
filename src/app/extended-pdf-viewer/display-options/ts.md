```typescript
@Component({
standalone: false,  ... })
export class DisplayOptionsComponent {
  public showBorders = false;

  public scrollMode = ScrollModeType.horizontal;

  public pageViewMode: PageViewModeType = 'multiple';

  public spread: 'off' | 'odd' | 'even' = 'off';
}
```
