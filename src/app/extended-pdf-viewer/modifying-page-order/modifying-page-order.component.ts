import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { NgxExtendedPdfViewerModule, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

export type PageOrderDemoTab = 'reorder' | 'splitMerge' | 'merge' | 'api';

@Component({
  selector: 'app-modifying-page-order',

  standalone: true,
  templateUrl: './modifying-page-order.component.html',
  styleUrls: ['./modifying-page-order.component.css'],
  imports: [Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective, AsyncPipe],
})
export class ModifyingPageOrderComponent implements OnDestroy {
  private themeService = inject(ThemeService);
  private cdr = inject(ChangeDetectorRef);
  private pdfService = inject(NgxExtendedPdfViewerService);

  public get theme(): string {
    return this.themeService.theme();
  }
  fullscreenService = inject(FullscreenService);

  public activeTab = 'html';
  public demoTab: PageOrderDemoTab = 'reorder';
  public showViewer = true;
  public enableSplitMerge = false;
  public enableMerge = false;

  /** What the last API call did, shown below the buttons. */
  public status = '';
  public busy = false;

  public onDemoTabChange(tab: PageOrderDemoTab): void {
    this.demoTab = tab;
    this.showViewer = false;
    this.enableSplitMerge = tab === 'splitMerge';
    this.enableMerge = tab === 'merge';
    this.status = '';
    setTimeout(() => {
      this.showViewer = true;
      this.cdr.markForCheck();
    });
  }

  public get pageCount(): number {
    return this.pdfService.getPageCount();
  }

  /** Puts another PDF file in front of the first page - the thing the "Add file" button can't do. */
  public async prependDocument(): Promise<void> {
    await this.run('added the pages of simple-demo-document.pdf in front of page 1', () =>
      this.pdfService.mergeDocument('/assets/pdfs/simple-demo-document.pdf', { insertAfterPage: 0 }),
    );
  }

  /** The same file, but at the end of the document. */
  public async appendDocument(): Promise<void> {
    await this.run('appended the pages of simple-demo-document.pdf', () => this.pdfService.mergeDocument('/assets/pdfs/simple-demo-document.pdf'));
  }

  /** Only the first page of the other file, inserted after the page the user is looking at. */
  public async insertOnePageHere(): Promise<void> {
    const currentPage = this.pdfService.getCurrentPage();
    await this.run(`inserted page 1 of simple-demo-document.pdf after page ${currentPage}`, () =>
      this.pdfService.mergeDocument('/assets/pdfs/simple-demo-document.pdf', { insertAfterPage: currentPage, includePages: [1] }),
    );
  }

  /** Adds an image as a new page. */
  public async addImageAsPage(): Promise<void> {
    await this.run('added the logo as a new page in front of the document', () =>
      this.pdfService.mergeDocument('/assets/images/ChatGPT-PDF-Viewer-Logo.jpg', { insertAfterPage: 0 }),
    );
  }

  /** Merges whatever the user picks in the file dialog. */
  public async mergeSelectedFiles(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) {
      return;
    }
    await this.run(`added ${files.length} file(s) in front of page 1`, () => this.pdfService.mergeDocument(files, { insertAfterPage: 0 }));
    input.value = '';
  }

  public async deleteFirstPage(): Promise<void> {
    await this.run('deleted page 1', () => this.pdfService.deletePages(1));
  }

  public async deletePagesTwoToThree(): Promise<void> {
    await this.run('deleted the pages 2 to 3', () => this.pdfService.deletePages([[2, 3]]));
  }

  /** Reloads the file, so the demo starts over. */
  public reset(): void {
    this.showViewer = false;
    this.status = '';
    setTimeout(() => {
      this.showViewer = true;
      this.cdr.markForCheck();
    });
  }

  private async run(description: string, action: () => Promise<void>): Promise<void> {
    this.busy = true;
    this.status = 'working...';
    try {
      await action();
      this.status = `${description}. The document now has ${this.pageCount} pages.`;
    } catch (error) {
      this.status = `That didn't work: ${(error as Error).message}`;
    } finally {
      this.busy = false;
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    // No need to reset pdfDefaultOptions — we use component inputs instead
  }
}
