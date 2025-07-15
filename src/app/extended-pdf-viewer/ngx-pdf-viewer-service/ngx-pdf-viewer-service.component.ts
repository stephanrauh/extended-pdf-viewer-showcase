import { Component, inject } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';
import { pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { DemoComponent } from '../common/demo.component';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { AsyncPipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-ngx-pdf-viewer-service',
  templateUrl: './ngx-pdf-viewer-service.component.html',
  styleUrls: ['./ngx-pdf-viewer-service.component.css'],
  imports: [
    MatTabGroup,
    MatTab,
    DemoComponent,
    NgxExtendedPdfViewerModule,
    Ie11MarkdownComponent,
    AsyncPipe,
  ],
})
export class NgxPdfViewerServiceComponent {
  fullscreenService = inject(FullscreenService);

  constructor() {
    pdfDefaultOptions.enablePageReordering = true;
  }
}
