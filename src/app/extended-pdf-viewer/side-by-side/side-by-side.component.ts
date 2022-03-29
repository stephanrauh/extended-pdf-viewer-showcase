import { ChangeDetectionStrategy, Component } from '@angular/core';
import {  NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-side-by-side',
  templateUrl: './side-by-side.component.html',
  styleUrls: ['./side-by-side.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideBySideComponent {


  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() =>
    this.pdfService.recalculateSize());
  }



  constructor(private pdfService: NgxExtendedPdfViewerService) {
}


}
