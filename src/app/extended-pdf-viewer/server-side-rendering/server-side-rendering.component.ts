import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { AnnotationLayerRenderedEvent, NgxExtendedPdfViewerService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-server-side-rendering',
    
    standalone: true,
    templateUrl: './server-side-rendering.component.html',
    styleUrls: ['./server-side-rendering.component.css'],
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        RouterLink,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ]
})
export class ServerSideRenderingComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
    public serversiderenderingcomponentTab: string = 'serversiderendering';
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
