import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-mouse-wheel',
  templateUrl: './mouse-wheel.component.html',
  styleUrls: ['./mouse-wheel.component.css'],
})
export class MouseWheelComponent {
  public selectedTab = 0;

  public wheelAction: 'scroll' | 'zoom' = 'zoom';

  public isLocalhost = isLocalhost();

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
}
