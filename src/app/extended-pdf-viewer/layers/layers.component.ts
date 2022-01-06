import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService, PdfLayer } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.css'],
})
export class LayersComponent {
  public selectedTab = 0;

  public layers: Array<PdfLayer> = [];

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.pdfService.recalculateSize());
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {}

  public onSelectedTab(event: number): void {
    this.selectedTab = event;
  }

  public async listLayers(): Promise<void> {
    const l = await this.pdfService.listLayers();
    if (l) {
      this.layers = l;
    } else {
      console.log("This document either hasn't layers, or you've called listLayers() before the PDF layers have been rendered");
    }
  }

  public async toggle(layerId: string): Promise<void> {
    await this.pdfService.toggleLayer(layerId);
    await this.listLayers();
  }
 }
