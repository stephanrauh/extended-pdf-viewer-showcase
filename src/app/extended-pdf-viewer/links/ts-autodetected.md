```typescript
// Prerequisites:
// - [textLayer]="true" must be set on the viewer
// - pdfDefaultOptions.enableAutoLinking must be true (default)

export class LinksComponent {
  annotationLayerLinks: string[] = [];
  autoDetectedLinks: string[] = [];

  onAnnotationLayerRendered(event: AnnotationLayerRenderedEvent) {
    // Explicit PDF link annotations are available now
    this.annotationLayerLinks = this.extractLinks(event.source.div);
  }

  onLinkAnnotationsAdded(event: LinkAnnotationsAddedEvent) {
    // Auto-detected links (URLs, emails found in text) are now available
    const allLinks = this.extractLinks(event.source.div);
    this.autoDetectedLinks = allLinks.filter(
      link => !this.annotationLayerLinks.includes(link)
    );
  }

  private extractLinks(div: HTMLDivElement): string[] {
    const links: string[] = [];
    div.querySelectorAll('a[href]').forEach((a: Element) => {
      const href = (a as HTMLAnchorElement).href;
      if (href && !href.startsWith('javascript:')) {
        links.push(href);
      }
    });
    return links;
  }
}
```
