import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { PageRenderEvent } from 'ngx-extended-pdf-viewer/lib/events/page-render-event';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-zoom',
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoomComponent {
  private _zoomSetting: number | string | undefined = 'page-width';

  public isMobile = 'ontouchstart' in document.documentElement;

  public enablePinchOnMobile = this.isMobile;

  public minZoom = 0.33;

  public maxZoom = 15;

  public zoomLevels = [
    'auto',
    'page-actual',
    'page-fit',
    'page-width',
    0.2,
    0.25,
    0.33,
    0.5,
    0.75,
    1,
    1.25,
    1.5,
    2,
    2.5,
    3,
    3.5,
    4,
    7,
    10,
    15,
  ];

  public time = 0;
  public currentTime = 0;

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() =>
    this.pdfService.recalculateSize());
  }

  private currentStartTime = new Date().getTime();

  public get zoomLevelsDisplay(): string {
    return this.zoomLevels.toString().replace(',', ', ');
  }

  public set zoomLevelsDisplay(list: string) {
    this.zoomLevels = list.split(',').map((x) => x.trim());
  }

  public currentZoomFactor: number | undefined;

  // getter and setter make the demo nicer -
  // you probably don't need them in your code
  public get zoomSetting(): string | number | undefined {
    return String(this._zoomSetting);
  }

  public set zoomSetting(zoom: string | number | undefined) {
    if (isNaN(Number(zoom))) {
      this._zoomSetting = zoom;
    } else {
      this._zoomSetting = `${zoom}%`;
    }
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {
      pdfDefaultOptions.maxCanvasPixels = -1;
  }

  public updateZoomFactor(zoom: number): void {
    this.currentZoomFactor = zoom;
  }

  public onPageRender(): void {
    this.currentStartTime = new Date().getTime();
  }

  public onPageRendered(): void {
    const endTime = new Date().getTime();
    this.currentTime = endTime - this.currentStartTime;
  }
}
