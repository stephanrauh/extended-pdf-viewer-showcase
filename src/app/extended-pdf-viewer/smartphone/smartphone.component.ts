import { Component, inject } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { DemoComponent } from '../common/demo.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-smartphone',
    templateUrl: './smartphone.component.html',
    styleUrls: ['./smartphone.component.css', './devices.min.css'],
    imports: [
        MatCard,
        Ie11MarkdownComponent,
        MatTabGroup,
        MatTab,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class SmartphoneComponent {
  public fullscreenService = inject(FullscreenService);

}
