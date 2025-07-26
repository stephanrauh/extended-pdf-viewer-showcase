import { Component, inject } from '@angular/core';
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
    public ngxpdfviewerservicecomponentTab: string = 'overview';
  public codeTab: string = 'typescript';
fullscreenService = inject(FullscreenService);

  constructor() {
    pdfDefaultOptions.enablePageReordering = true;
  }
}
