```typescript
export class LinksComponent {
  // Deactivate links that are defined in the PDF file
  public afterAnnotationLayerRendered(event: AnnotationLayerRenderedEvent) {
    this.deactivateLinks(event.source.div as HTMLDivElement);
  }

  // Deactivate auto-detected links (URLs found in text)
  public afterLinkAnnotationsAdded(event: LinkAnnotationsAddedEvent) {
    this.deactivateLinks(event.source.div as HTMLDivElement);
  }

  private deactivateLinks(div: HTMLDivElement) {
    div.querySelectorAll('a').forEach((a: HTMLAnchorElement) => {
      a.href = 'javascript: void(0)';
      a.target = '';
    });
  }
}
```
