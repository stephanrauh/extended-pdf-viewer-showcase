import { Component, OnInit } from '@angular/core';
import {
  pdfDefaultOptions,
  LinkTarget,
  PageRenderedEvent,
  NgxExtendedPdfViewerService,
} from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';
@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.css'],
})
export class LinksComponent implements OnInit {
  public LinkTarget = LinkTarget;

  public hidden = false;

  // tslint:disable-next-line: variable-name
  private _target!: number;

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() =>
    this.pdfService.recalculateSize());
  }

  // tslint:disable-next-line: variable-name
  private _selectedTab = 0;

  public set selectedTab(tab: number) {
    this._selectedTab = tab;
    this.hidden = true;
    setTimeout(() => (this.hidden = false), 250);
  }

  public get selectedTab(): number {
    return this._selectedTab;
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {}

  public set target(t: number) {
    if (this._target !== t) {
      this._target = t;
      this.hidden = true;
      pdfDefaultOptions.externalLinkTarget = t;
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

  public ngOnInit() {
    this.target = LinkTarget.BLANK;
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
...
ngOnInit(): void {
  pdfDefaultOptions.externalLinkTarget = LinkTarget.${this.target};
}`;
  }
}
