import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { NgxExtendedPdfViewerService, PdfLayer, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-layers',
    
    standalone: true,
    templateUrl: './layers.component.html',
    styleUrls: ['./layers.component.css'],
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class LayersComponent {
  private cdr = inject(ChangeDetectorRef);
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  private pdfService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  public selectedTab = 0;

  public layers: PdfLayer[] = [];
  public layerscomponentTab: string = 'ui';
  public codeTab: string = 'htmltemplate';

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

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
    this.cdr.markForCheck();
  }

  public async toggle(layerId: string): Promise<void> {
    await this.pdfService.toggleLayer(layerId);
    await this.listLayers();
  }
}
