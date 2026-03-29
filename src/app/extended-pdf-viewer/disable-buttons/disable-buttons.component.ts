import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { NgxExtendedPdfViewerModule, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { FullscreenService } from '../../services/fullscreen.service';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';
import { LanguagePipe } from 'ngx-markdown';

@Component({
    selector: 'app-disable-buttons',

    standalone: true,
    templateUrl: './disable-buttons.component.html',
    styleUrls: ['./disable-buttons.component.css'],
    imports: [
        FormsModule,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective,
        AsyncPipe,
        LanguagePipe,
    ],
})
export class DisableButtonsComponent {
  private themeService = inject(ThemeService);
  fullscreenService = inject(FullscreenService);

  constructor() {
    pdfDefaultOptions.enableSignatureEditor = true;
    pdfDefaultOptions.enableComment = true;
  }

  public get theme(): string {
    return this.themeService.theme();
  }

  // Disable all editor buttons at once
  public disableEditorButtons = false;

  // Individual disable flags
  public disableSidebarButton = false;
  public disableFindButton = false;
  public disableMovePageButton = false;
  public disablePagingButtons = false;
  public disableFirstAndLastPageButtons = false;
  public disablePreviousAndNextPageButtons = false;
  public disablePageNumber = false;
  public disableZoomButtons = false;
  public disableZoomDropdown = false;
  public disablePresentationModeButton = false;
  public disableOpenFileButton = false;
  public disablePrintButton = false;
  public disableDownloadButton = false;
  public disableSecondaryToolbarButton = false;
  public disableRotateCwButton = false;
  public disableRotateCcwButton = false;
  public disableHandToolButton = false;
  public disableSpreadButton = false;
  public disablePropertiesButton = false;
  public disableSinglePageModeButton = false;
  public disableVerticalScrollButton = false;
  public disableHorizontalScrollButton = false;
  public disableWrappedScrollButton = false;
  public disableInfiniteScrollButton = false;
  public disableBookModeButton = false;
  public disableTextEditor = false;
  public disableDrawEditor = false;
  public disableStampEditor = false;
  public disableHighlightEditor = false;
  public disableCommentEditor = false;
  public disableSignatureEditor = false;

  public get sourcecode() {
    const attrs: string[] = [];
    const add = (name: string, value: boolean) => { if (value) attrs.push(`  [${name}]="true"`); };

    add('disableEditorButtons', this.disableEditorButtons);
    add('disableTextEditor', this.disableTextEditor);
    add('disableDrawEditor', this.disableDrawEditor);
    add('disableStampEditor', this.disableStampEditor);
    add('disableHighlightEditor', this.disableHighlightEditor);
    add('disableCommentEditor', this.disableCommentEditor);
    add('disableSignatureEditor', this.disableSignatureEditor);
    add('disableSidebarButton', this.disableSidebarButton);
    add('disableFindButton', this.disableFindButton);
    add('disableMovePageButton', this.disableMovePageButton);
    add('disablePagingButtons', this.disablePagingButtons);
    add('disableFirstAndLastPageButtons', this.disableFirstAndLastPageButtons);
    add('disablePreviousAndNextPageButtons', this.disablePreviousAndNextPageButtons);
    add('disablePageNumber', this.disablePageNumber);
    add('disableZoomButtons', this.disableZoomButtons);
    add('disableZoomDropdown', this.disableZoomDropdown);
    add('disablePresentationModeButton', this.disablePresentationModeButton);
    add('disableOpenFileButton', this.disableOpenFileButton);
    add('disablePrintButton', this.disablePrintButton);
    add('disableDownloadButton', this.disableDownloadButton);
    add('disableSecondaryToolbarButton', this.disableSecondaryToolbarButton);
    add('disableRotateCwButton', this.disableRotateCwButton);
    add('disableRotateCcwButton', this.disableRotateCcwButton);
    add('disableHandToolButton', this.disableHandToolButton);
    add('disableSpreadButton', this.disableSpreadButton);
    add('disablePropertiesButton', this.disablePropertiesButton);
    add('disableSinglePageModeButton', this.disableSinglePageModeButton);
    add('disableVerticalScrollButton', this.disableVerticalScrollButton);
    add('disableHorizontalScrollButton', this.disableHorizontalScrollButton);
    add('disableWrappedScrollButton', this.disableWrappedScrollButton);
    add('disableInfiniteScrollButton', this.disableInfiniteScrollButton);
    add('disableBookModeButton', this.disableBookModeButton);

    if (attrs.length === 0) {
      return `<ngx-extended-pdf-viewer
  [src]="'assets/example.pdf'">
</ngx-extended-pdf-viewer>`;
    }
    return `<ngx-extended-pdf-viewer
  [src]="'assets/example.pdf'"
${attrs.join('\n')}>
</ngx-extended-pdf-viewer>`;
  }
}
