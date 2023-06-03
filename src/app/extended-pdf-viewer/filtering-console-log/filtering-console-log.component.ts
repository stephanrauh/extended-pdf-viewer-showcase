import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';
import { WindowRefService } from 'src/app/window-ref.servce';

@Component({
  selector: 'app-filtering-console-log',
  templateUrl: './filtering-console-log.component.html',
  styleUrls: ['./filtering-console-log.component.css'],
})
export class FilteringConsoleLogComponent {
  public version = '';

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

  constructor(private pdfService: NgxExtendedPdfViewerService, @Inject(PLATFORM_ID) private platformId: any, private windowRefService: WindowRefService) {
    if (windowRefService.nativeWindow) {
      globalThis['ngxConsoleFilter'] = (level: string, message: any): boolean => {
        if (message?.includes && message?.includes('modified by ngx-extended-pdf-viewer')) {
          this.version = message;
          return false;
        }
        return true;
      };
    }
  }
}
