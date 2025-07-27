import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';
import { ThemeService } from '../../services/theme.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AsyncPipe } from '@angular/common';
@Component({
    selector: 'app-forms',
    
    standalone: true,
    templateUrl: './theming.component.html',
    styleUrls: ['./theming.component.css'],
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class ThemingComponent {
  private themeService = inject(ThemeService);
  public fullscreenService = inject(FullscreenService);
  public _selectedTab = 1;

  public get theme(): string {
    return this.themeService.theme();
  }
  public backgroundColor = 'lightgrey';
  public src = '/assets/pdfs/OoPdfFormExample.pdf';
  public themingcomponentTab: string = 'lighttheme';
  public codeTab: string = 'htmltemplate';

  public get selectedTab() {
    return this._selectedTab;
  }

  public set selectedTab(tab: number) {
    this._selectedTab = tab;
    if (tab === 1) {
      this.themeService.setTheme('light');
      this.backgroundColor = 'lightgrey';
      this.src = '/assets/pdfs/OoPdfFormExample.pdf';
    }
    if (tab === 2) {
      this.themeService.setTheme('dark');
      this.backgroundColor = 'black';
      this.src = '/assets/pdfs/OoPdfFormExample-dark.pdf';
    }
  }

  public onSelectTab(event: any): void {
    this.selectedTab = event.index + 1;
  }
}
