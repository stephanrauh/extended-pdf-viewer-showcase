import { Component, inject } from '@angular/core';
import { PageViewModeType, ScrollModeType, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-display-options',
    templateUrl: './display-options.component.html',
    styleUrls: ['./display-options.component.css'],
    imports: [
        MatCard,
        MatCheckbox,
        FormsModule,
        MatRadioGroup,
        MatRadioButton,
        MatTabGroup,
        MatTab,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class DisplayOptionsComponent {
  public fullscreenService = inject(FullscreenService);

  public showBorders = false;

  public scrollMode = ScrollModeType.horizontal;

  public pageViewMode: PageViewModeType = 'multiple';

  public spread: 'off' | 'odd' | 'even' = 'off';

}
