import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
standalone: false,
  selector: 'app-contextmenu',
  templateUrl: './contextmenu.component.html',
  styleUrls: ['./contextmenu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContextmenuComponent {
  public allowContextMenu = false;

  private _fullscreen = false;



  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;

  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {}
}
