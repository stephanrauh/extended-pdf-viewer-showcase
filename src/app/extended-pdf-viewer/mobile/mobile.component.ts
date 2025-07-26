import { Component, inject } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-mobile',
    
    standalone: true,
    templateUrl: './mobile.component.html',
    styleUrls: ['./mobile.component.css'],
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class MobileComponent {
  public fullscreenService = inject(FullscreenService);

  public mobileFriendlyZoomSetting = '150%';
  public mobilecomponentTab: string = 'mobilemode';
  public codeTab: string = 'typescript';

}
