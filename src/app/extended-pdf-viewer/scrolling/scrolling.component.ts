import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';

@Component({
  standalone: false,
  selector: 'app-scrolling',
  templateUrl: './scrolling.component.html',
  styleUrls: ['./scrolling.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollingComponent {
  private _fullscreen = false;

  public selectedTab = 0;

  public zoom = 'page-width';

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public get src(): string {
    if (this.selectedTab === 0) {
      return './assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf';
    } else {
      return './assets/pdfs/issue1707-with-rulers.pdf';
    }
  }

  constructor(private pdfService: NgxExtendedPdfViewerService, public fullscreenService: FullscreenService) {}

  public scroll(pageNumber: number, top: number | string): void {
    this.pdfService.scrollPageIntoView(pageNumber, { top });
  }

  public scrollLeft(pageNumber: number, left: string): void {
    this.pdfService.scrollPageIntoView(pageNumber, { left });
  }

  /*
  public scrollRight(pageNumber: number, right: string): void {
    // this.pdfService.scrollPageIntoView(pageNumber, { right });
  }
  */
}
