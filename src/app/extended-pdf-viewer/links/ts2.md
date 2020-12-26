```typescript
export class LinksComponent {
 public afterPageRendered(pageRenderedEvent: PageRenderedEvent) {
    const pageView = pageRenderedEvent.source; /* as PdfPageView */
    const div = pageView.div as HTMLDivElement;
    div.querySelectorAll('a').forEach((a: HTMLAnchorElement) => {
      a.href = 'javascript: void(0)';
      a.target = '';
    });
  }
}
```
