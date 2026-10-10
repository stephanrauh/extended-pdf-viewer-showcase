```typescript
export class LayersComponent {
  public layers: PdfLayer[] = [];

  constructor(private pdfService: NgxExtendedPdfViewerService) {}

  public async listLayers(): Promise<void> {
    const l = await this.pdfService.listLayers();
    if (l) {
      this.layers = l;
    }
  }

  public async toggle(layerId: string): Promise<void> {
    // (layerVisibilityChanged) updates the list
    await this.pdfService.toggleLayer(layerId);
  }

  public onLayerVisibilityChanged(layers: PdfLayer[]): void {
    this.layers = layers;
  }
}
```
