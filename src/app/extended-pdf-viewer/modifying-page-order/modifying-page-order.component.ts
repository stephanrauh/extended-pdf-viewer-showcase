import { Component, inject } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';
import { pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-modifying-page-order',

  standalone: true,
  templateUrl: './modifying-page-order.component.html',
  styleUrls: ['./modifying-page-order.component.css'],
  imports: [Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, AsyncPipe],
})
export class ModifyingPageOrderComponent {
  fullscreenService = inject(FullscreenService);

  public activeTab = 'html';

  constructor() {
    pdfDefaultOptions.enablePageReordering = true;
  }
}
