import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-i18n',

    standalone: true,
    templateUrl: './i18n.component.html',
    styleUrls: ['./i18n.component.css'],
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
        FormsModule
    ],
})
export class I18nComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  public fullscreenService = inject(FullscreenService);

  public hidePdfViewer = false;

  public _selectedTab = 0;
  public i18ncomponentTab: string = 'usingaspecificlanguage';
  public codeTab: string = 'htmltemplate';
  private _language: string | undefined = 'nl-BE';

  public get selectedTab(): number {
    return this._selectedTab;
  }

  public set selectedTab(tab: number) {
    this._selectedTab = tab;
    this.hidePdfViewer = true;
    setTimeout(() => {
      this.hidePdfViewer = false;
    });
  }

  public get language(): string {
    return this._language || '';
  }

  public set language(language: string) {
    let writingDirectionChange = false;
    if (this._language === 'ar' && language !== 'ar') {
      writingDirectionChange = true;
    }
    if (this._language !== 'ar' && language === 'ar') {
      writingDirectionChange = true;
    }
    this._language = language;

    if (writingDirectionChange) {
      // brute force approach necessary to swap margins between LTR and RTL languages
      const mainContent = document.querySelector('main') as HTMLElement;
      if (mainContent) {
        const styleLeft = mainContent.style.marginLeft;
        const styleRight = mainContent.style.marginRight;
        mainContent.style.marginLeft = styleRight;
        mainContent.style.marginRight = styleLeft;
      }
    }

    this.hidePdfViewer = true;
    setTimeout(() => {
      this.hidePdfViewer = false;
    });
  }
}
