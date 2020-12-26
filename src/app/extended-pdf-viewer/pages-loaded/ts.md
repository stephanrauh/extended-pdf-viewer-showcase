```typescript
@Component({ ... })
export class PagesLoadedComponent {
  public messages: Array<string> = [];

  public onPagesLoaded(pagecount: PagesLoadedEvent): void {
    const now = new Date().toLocaleTimeString();
    this.messages.push(`${now} Loaded a document with ${pagecount.pagesCount} pages`);
  }
}
```
