import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { NgxExtendedPdfViewerService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-presentations',

    standalone: true,
    templateUrl: './presentations.component.html',
    styleUrls: ['./presentations.component.css'],
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class PresentationComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
    public activeTab: string = 'html';
private pdfService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);
  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;

  }
 }
