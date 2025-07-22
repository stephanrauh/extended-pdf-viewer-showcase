import { Component, inject } from '@angular/core';
import { LinkTarget, PageRenderedEvent, pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from 'src/app/services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';
import { LanguagePipe } from 'ngx-markdown';
@Component({
    selector: 'app-links',
    
    standalone: true,
    templateUrl: './links.component.html',
    styleUrls: ['./links.component.css'],
    imports: [
        MatCard,
        MatTabGroup,
        MatTab,
        MatRadioGroup,
        MatRadioButton,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
        LanguagePipe,
    ],
})
export class LinksComponent {
  fullscreenService = inject(FullscreenService);

  public LinkTarget = LinkTarget;

  public hidden = false;

  private _target: number = LinkTarget.BLANK;

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  private _selectedTab = 0;

  public set selectedTab(tab: number) {
    this._selectedTab = tab;
    this.hidden = true;
    setTimeout(() => (this.hidden = false), 250);
  }

  public get selectedTab(): number {
    return this._selectedTab;
  }

  constructor() {
    pdfDefaultOptions.externalLinkTarget = this._target;
  }

  public set target(t: number) {
    if (this._target !== t) {
      this._target = t;
      this.hidden = true;
      pdfDefaultOptions.externalLinkTarget = t;
      console.log('externalLinkTarget', pdfDefaultOptions.externalLinkTarget);
      setTimeout(() => (this.hidden = false), 250);
    }
  }

  public get target(): number {
    return this._target;
  }

  public afterPageRendered(pageRenderedEvent: PageRenderedEvent) {
    if (this._selectedTab === 2) {
      const pageView = pageRenderedEvent.source; /* as PdfPageView */
      const div = pageView.div as HTMLDivElement;
      div.querySelectorAll('a').forEach((a: HTMLAnchorElement) => {
        a.href = 'javascript: void(0)';
        a.target = '';
      });
    }
  }

  public get sourcecode(): string {
    let target: string;
    switch (this._target) {
      case LinkTarget.BLANK:
        target = 'BLANK';
        break;
      case LinkTarget.NONE:
        target = 'NONE';
        break;
      case LinkTarget.PARENT:
        target = 'PARENT';
        break;
      case LinkTarget.SELF:
        target = 'SELF';
        break;
      case LinkTarget.TOP:
        target = 'TOP';
        break;
    }

    return `import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer/default-options';
import { LinkTarget } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
...
ngOnInit(): void {
  pdfDefaultOptions.externalLinkTarget = LinkTarget.${this.target};
}`;
  }
}
