import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { RouterLink } from '@angular/router';
import { CopyrightComponent } from '../common/copyright.component';
import { FullscreenButtonComponent } from '../../components/fullscreen-button/fullscreen-button.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-page-view-mode',
    
    standalone: true,
    templateUrl: './page-view-mode.component.html',
    styleUrls: ['./page-view-mode.component.css'],
    imports: [
        FormsModule,
        Ie11MarkdownComponent,
        RouterLink,
        CopyrightComponent,
        FullscreenButtonComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class PageViewModeComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  public fullscreenService = inject(FullscreenService);

  public page = 5;

  public spreadMode: 'off' | 'even' | 'odd' = 'off';

  public showBorders = true;
  public pageviewmodecomponentTab: string = 'gettingstarted';

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }
}
