```typescript
public afterPageRendered(pageRenderedEvent: any) {
    const pageView = pageRenderedEvent.source; /* as PdfPageView */
    const div = pageView.div as HTMLDivElement;
    if (this.choice === 'inactive') {
      div.querySelectorAll('a').forEach((a: HTMLAnchorElement) => {
        a.href = 'javascript: void(0)';
        a.target = '';
      });
    } else if (this.choice === 'angular') {
      div.querySelectorAll('a').forEach((a: HTMLAnchorElement) => {
        a.onclick = () => setTimeout(() => this.count());
        a.target = '';
        a.href = 'javascript: void();';
      });
    }
}
```
