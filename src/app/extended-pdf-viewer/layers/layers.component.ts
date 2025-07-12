import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService, PdfLayer } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';

@Component({
  standalone: false,
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.css'],
})
export class LayersComponent {
  public selectedTab = 0;

  public layers: PdfLayer[] = [];

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor(private pdfService: NgxExtendedPdfViewerService, public fullscreenService: FullscreenService) {}

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
