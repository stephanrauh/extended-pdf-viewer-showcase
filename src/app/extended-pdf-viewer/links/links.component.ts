import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { AnnotationLayerRenderedEvent, LinkAnnotationsAddedEvent, LinkTarget, pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';
import { LanguagePipe } from 'ngx-markdown';
import { FormsModule } from '@angular/forms';
@Component({
    selector: 'app-links',

    standalone: true,
    templateUrl: './links.component.html',
    styleUrls: ['./links.component.css'],
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective,
        AsyncPipe,
        LanguagePipe,
        FormsModule
    ],
})
export class LinksComponent {
  private cdr = inject(ChangeDetectorRef);
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  fullscreenService = inject(FullscreenService);

  public LinkTarget = LinkTarget;

  public hidden = false;
  public linkscomponentTab: string = 'defaultlinktargets';
  public codeTab: string = 'typescript';

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
    setTimeout(() => {
      this.hidden = false;
      this.cdr.markForCheck();
    }, 250);
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
      setTimeout(() => {
        this.hidden = false;
        this.cdr.markForCheck();
      }, 250);
    }
  }

  public get target(): number {
    return this._target;
  }

  public annotationLayerLinks: string[] = [];
  public autoDetectedLinks: string[] = [];

  /**
   * The (annotationLayerRendered) and (linkAnnotationsAdded) events only fire while a page is
   * being rendered. Pages that are already on screen when you open the "Deactivating links" tab
   * never see them, so reload the viewer to render every page again - and to bring the links
   * back when you leave the tab.
   */
  public selectTab(tab: string): void {
    if (this.linkscomponentTab === tab) {
      return;
    }
    const deactivationChanged = this.linkscomponentTab === 'deactivatinglinks' || tab === 'deactivatinglinks';
    this.linkscomponentTab = tab;
    if (tab === 'autodetected') {
      this.resetAutoDetectedLinks();
    } else if (deactivationChanged) {
      this.reloadViewer();
    }
  }

  private reloadViewer(): void {
    this.hidden = true;
    setTimeout(() => {
      this.hidden = false;
      this.cdr.markForCheck();
    }, 250);
  }

  public afterAnnotationLayerRendered(event: AnnotationLayerRenderedEvent) {
    if (this.linkscomponentTab === 'deactivatinglinks') {
      this.deactivateLinks(event.source.div as HTMLDivElement);
    }
  }

  public afterLinkAnnotationsAdded(event: LinkAnnotationsAddedEvent) {
    if (this.linkscomponentTab === 'deactivatinglinks') {
      this.deactivateLinks(event.source.div as HTMLDivElement);
    }
  }

  private deactivateLinks(div: HTMLDivElement) {
    div.querySelectorAll('a').forEach((a: HTMLAnchorElement) => {
      a.href = 'javascript: void(0)';
      a.target = '';
    });
  }

  public resetAutoDetectedLinks() {
    this.annotationLayerLinks = [];
    this.autoDetectedLinks = [];
    this.reloadViewer();
  }

  private extractLinks(div: HTMLDivElement): string[] {
    const links: string[] = [];
    div.querySelectorAll('a[href]').forEach((a: Element) => {
      const href = (a as HTMLAnchorElement).href;
      if (href && !href.startsWith('javascript:')) {
        links.push(href);
      }
    });
    return links;
  }

  public onAutoDetectedAnnotationLayerRendered(event: AnnotationLayerRenderedEvent) {
    const links = this.extractLinks(event.source.div as HTMLDivElement);
    this.annotationLayerLinks = [...new Set([...this.annotationLayerLinks, ...links])];
    this.cdr.markForCheck();
  }

  public onAutoDetectedLinkAnnotationsAdded(event: LinkAnnotationsAddedEvent) {
    const allLinks = this.extractLinks(event.source.div as HTMLDivElement);
    this.autoDetectedLinks = [...new Set([...this.autoDetectedLinks, ...allLinks])];
    this.cdr.markForCheck();
  }

  public get sourcecode(): string {
    let target = 'BLANK';
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
  pdfDefaultOptions.externalLinkTarget = LinkTarget.${target};
}`;
  }
}
