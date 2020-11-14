```typescript
 @Component({
  selector: 'app-infinite-scroll',
  templateUrl: './infinite-scroll.component.html',
  styleUrls: ['./infinite-scroll.component.css']
})
export class InfiniteComponent {
  public height = '100vh';

  public showWidgets = false;

  public onPagesLoaded(event: PagesLoadedEvent): void {
    const h = event.source.viewer.clientHeight;
    if (this.showWidgets) {
      this.height = h + 35 + 'px';
    } else {
      this.height = h + 'px';
    }
  }
}
```
