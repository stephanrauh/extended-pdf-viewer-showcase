```typescript
export class PagesLoadedComponent implements OnInit {
  public messages: Array<string> = [];

  constructor() {}

  ngOnInit() {}

  public onPagesLoaded(pagecount: PagesLoadedEvent): void {
    const now = new Date().toLocaleTimeString();
    this.messages.push(\`\${now} Loaded a document with \${pagecount.pagesCount}  pages\`);
  }
}
```
