import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-contextmenu',
  templateUrl: './contextmenu.component.html',
  styleUrls: ['./contextmenu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContextmenuComponent {
  public allowContextMenu = false;

  private _fullscreen = false;

  public isLocalhost = isLocalhost();

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() =>
    this.pdfService.recalculateSize());
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {}
}
