import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { DemoComponent } from '../common/demo.component';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-ngx-pdf-viewer-service',
  
    standalone: true,
    templateUrl: './ngx-pdf-viewer-service.component.html',
  styleUrls: ['./ngx-pdf-viewer-service.component.css'],
  imports: [
        DemoComponent,
        NgxExtendedPdfViewerModule,
        Ie11MarkdownComponent,
        AsyncPipe,
    ],
})
export class NgxPdfViewerServiceComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
    public ngxpdfviewerservicecomponentTab: string = 'overview';
  public codeTab: string = 'htmltemplate';
fullscreenService = inject(FullscreenService);

  constructor() {
    pdfDefaultOptions.enablePageReordering = true;
  }
}
