import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { IPDFViewerApplication, NgxExtendedPdfViewerService, PDFNotificationService, RenderedTextLayerHighlights, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FindState, FindResultMatchesCount } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { FullscreenButtonComponent } from '../../components/fullscreen-button/fullscreen-button.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-find',
    
    standalone: true,
    templateUrl: './find.component.html',
    styleUrls: ['./find.component.css'],
    imports: [
        FormsModule,
        Ie11MarkdownComponent,
        FullscreenButtonComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class FindComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
   private ngxExtendedPdfViewerService = inject(NgxExtendedPdfViewerService);
   private cdr = inject(ChangeDetectorRef);
   fullscreenService = inject(FullscreenService);

   public _searchtext = '';

  public highlightAll = false;
  public matchCase = false;
  public wholeWord = false;
  public matchDiacritics = false;

  public multiple = false;

  public matchRegExp = false;

  public _searchtext2 = 'Portuguese';

  public highlightAll2 = false;
  public matchCase2 = false;
  public wholeWord2 = false;
  public matchDiacritics2 = false;

  public multiple2 = false;

  public matchRegExp2 = false;

  public currentMatchNumber: number | undefined;

  public totalMatches: number | undefined;

  public findState: FindState | undefined;

  private _fullscreen = false;

  private _selectedTab = 0;
  private PDFViewerApplication!: IPDFViewerApplication;
  public dontScrollIntoView: boolean | undefined;
  public dontScrollIntoView2: boolean | undefined;

  public pagesWithResult: number[] = [];
  public findcomponentTab: string = 'findapi';
  public codeTab: string = 'htmltemplate';

  public get selectedTab(): number {
    return this._selectedTab;
  }

  public set selectedTab(tab) {
    this._selectedTab = tab;
    if (tab === 1) {
        this._searchtext = "Brazilian";
        this.highlightAll = true;
        const promises = this.find() as Promise<number>[];

        // delay the second search to make sure the first search has scrolled to the first result
        const wrappedPromises = promises.map(p =>
          p.then(result => result > 0 ? result : Promise.reject())
        );
        ((async () => {
        await Promise.any(wrappedPromises);
        this._searchtext2 = "Portuguese";
        this.highlightAll2 = true;
        this.find2();
        }))();
    } else {
      this._searchtext2 = "";
      this.highlightAll2 = false;
      this.find2();
    }
  }

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public get findStateText(): string {
    switch (this.findState) {
      case FindState.FOUND:
        return 'found';
      case FindState.NOT_FOUND:
        return 'not found';
      case FindState.PENDING:
        return 'pending';
      case FindState.WRAPPED:
        return 'wrapped';
    }
    return '';
  }

  public get searchtext(): string {
    return this._searchtext;
  }

  public set searchtext(text: string) {
    this._searchtext = text;
    this.find();
  }

  public get searchtext2(): string {
    return this._searchtext2;
  }

  public set searchtext2(text: string) {
    this._searchtext2 = text;
    this.find2();
  }

  private find(): Promise<number>[] | undefined {
    this.pagesWithResult = [];
    if (!this._searchtext) {
      this.findState = undefined;
      this.currentMatchNumber = undefined;
      this.totalMatches = undefined;
    }
    const searchtext = this.multiple ? this._searchtext.split(' ') : this._searchtext;
    const numberOfResultsPromises = this.ngxExtendedPdfViewerService.find(searchtext, {
      highlightAll: this.highlightAll,
      matchCase: this.matchCase,
      wholeWords: this.wholeWord,
      matchDiacritics: this.matchDiacritics,
      dontScrollIntoView: this.dontScrollIntoView,
      useSecondaryFindcontroller: false,
      findMultiple: this.multiple,
      regexp: this.matchRegExp
    });
    numberOfResultsPromises?.forEach(async (numberOfResultsPromise, pageIndex) => {
      const numberOfResultsPerPage = await numberOfResultsPromise;
      if (numberOfResultsPerPage > 0) {
        this.pagesWithResult.push(pageIndex);
      }
    });
    return numberOfResultsPromises;
  }

  private find2(): Promise<number>[] | undefined {
    this.pagesWithResult = [];
    if (!this._searchtext2) {
      this.findState = undefined;
      this.currentMatchNumber = undefined;
      this.totalMatches = undefined;
    }
    const numberOfResultsPromises = this.ngxExtendedPdfViewerService.find(this._searchtext2, {
      highlightAll: this.highlightAll2,
      matchCase: this.matchCase2,
      wholeWords: this.wholeWord2,
      matchDiacritics: this.matchDiacritics2,
      dontScrollIntoView: this.dontScrollIntoView2,
      useSecondaryFindcontroller: true,
      findMultiple: this.multiple2,
      regexp: this.matchRegExp2
    });
    numberOfResultsPromises?.forEach(async (numberOfResultsPromise, pageIndex) => {
      const numberOfResultsPerPage = await numberOfResultsPromise;
      if (numberOfResultsPerPage > 0) {
        this.pagesWithResult.push(pageIndex);
      }
    });
    return numberOfResultsPromises;
  }

  constructor() {
    const notificationService = inject(PDFNotificationService);

    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
      this.PDFViewerApplication?.eventBus?.on('renderedtextlayerhighlights', (event: RenderedTextLayerHighlights) => {
        event.highlights.forEach((highlight) => {
          highlight.style.border = '2px solid black';
        });
      });
    });
  }

  public updateFindState(result: FindState) {
    this.findState = result;
  }

  public updateFindMatchesCount(result: FindResultMatchesCount) {
    this.currentMatchNumber = result.current;
    this.totalMatches = result.total;
    this.cdr.detectChanges();
  }

  public onCheckboxClicked() {
    const searchtext = this.multiple ? this._searchtext.split(' ') : this._searchtext;
    this.ngxExtendedPdfViewerService.find(searchtext, {
      highlightAll: this.highlightAll,
      matchCase: this.matchCase,
      wholeWords: this.wholeWord,
      matchDiacritics: this.matchDiacritics,
      findMultiple: this.multiple,
      regexp: this.matchRegExp,
      dontScrollIntoView: this.dontScrollIntoView,
      useSecondaryFindcontroller: false
    });
  }

  public onCheckboxClicked2() {
    this.ngxExtendedPdfViewerService.find(this._searchtext2, {
      highlightAll: this.highlightAll2,
      matchCase: this.matchCase2,
      wholeWords: this.wholeWord2,
      matchDiacritics: this.matchDiacritics2,
      findMultiple: this.multiple2,
      regexp: this.matchRegExp2,
      dontScrollIntoView: this.dontScrollIntoView2,
      useSecondaryFindcontroller: true
    });
  }
  public findNext(useSecondaryFindcontroller: boolean): void {
    this.ngxExtendedPdfViewerService.findNext(useSecondaryFindcontroller);
  }

  public findPrevious(useSecondaryFindcontroller: boolean): void {
    this.ngxExtendedPdfViewerService.findPrevious(useSecondaryFindcontroller);
  }
}
