import { Component, inject } from '@angular/core';
import { PageViewModeType, ScrollModeType, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-display-options',

  standalone: true,
  templateUrl: './display-options.component.html',
  styleUrls: ['./display-options.component.css'],
  imports: [FormsModule, Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, AsyncPipe],
})
export class DisplayOptionsComponent {
  public fullscreenService = inject(FullscreenService);

  public activeTab = 'html';

  public showBorders = false;

  public scrollMode = ScrollModeType.horizontal;

  public pageViewMode: PageViewModeType = 'multiple';

  public spread: 'off' | 'odd' | 'even' = 'off';
}
