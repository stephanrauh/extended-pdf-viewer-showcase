```typescript
export class LayersComponent {

  constructor(private pdfService: NgxExtendedPdfViewerService) {}

  public async listLayers(): Promise<void> {
    const l = await this.pdfService.listLayers();
    if (l) {
      this.layers = l;
    }
  }

  public async toggle(layerId: string): Promise<void> {
    await this.pdfService.toggleLayer(layerId);
    await this.listLayers();
  }
}
```
