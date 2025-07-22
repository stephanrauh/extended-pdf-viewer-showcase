import { Component, inject } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { MatLabel } from '@angular/material/form-field';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { DemoComponent } from '../common/demo.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-mobile',
    
    standalone: true,
    templateUrl: './mobile.component.html',
    styleUrls: ['./mobile.component.css'],
    imports: [
        MatCard,
        MatTabGroup,
        MatTab,
        Ie11MarkdownComponent,
        MatLabel,
        MatRadioGroup,
        MatRadioButton,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class MobileComponent {
  public fullscreenService = inject(FullscreenService);

  public mobileFriendlyZoomSetting = '150%';

}
