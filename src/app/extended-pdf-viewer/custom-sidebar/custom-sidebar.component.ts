import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { NgxExtendedPdfViewerService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-custom-sidebar',

  standalone: true,
  templateUrl: './custom-sidebar.component.html',
  styleUrls: ['./custom-sidebar.component.css'],
  imports: [FormsModule, Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, AsyncPipe],
})
export class CustomSidebarComponent {
  private cdr = inject(ChangeDetectorRef);
  public fullscreenService = inject(FullscreenService);

  public activeTab = 'html';

  public theme = "light";

  public _sidebarType = 'without';

  public showPdfViewer = true;

  public sidebarOpen = true;

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public set sidebarType(sidebarType: string) {
    if (this._sidebarType !== sidebarType) {
      this.showPdfViewer = false;
      this._sidebarType = sidebarType;
      setTimeout(() => {
        this.showPdfViewer = true;
        this.cdr.markForCheck();
      }, 500);
    } else {
      this._sidebarType = sidebarType;
    }
  }

  public get sidebarType(): string {
    return this._sidebarType;
  }
}
