import { ChangeDetectorRef, Component, effect, OnDestroy, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { FindOptions, FindResultMatchesCount, IPDFViewerApplication, pdfDefaultOptions, PDFNotificationService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MyCustomFindController } from './my-custom-find-controller';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { FullscreenButtonComponent } from '../../components/fullscreen-button/fullscreen-button.component';

interface CustomFindOptions extends FindOptions {
  matchRegex: boolean;
}

@Component({
    selector: 'app-custom-find',
    
    standalone: true,
    templateUrl: './custom-find.component.html',
    styleUrls: ['./custom-find.component.scss'],
    imports: [
        FormsModule,
        Ie11MarkdownComponent,
        FullscreenButtonComponent,
        NgxExtendedPdfViewerModule,
    ],
})
export class CustomFindComponent implements OnDestroy {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  private readonly cdr = inject(ChangeDetectorRef);
  notificationService = inject(PDFNotificationService);

  public searchtext = '(?<=\\s)([A-z]+ough)';
  findOptions: CustomFindOptions = {
    highlightAll: true,
    matchCase: false,
    wholeWords: false,
    matchDiacritics: false,
    matchRegex: true,
  };

  public currentMatchNumber: number | undefined;
  public totalMatches: number | undefined;

  private pdfViewerApplication: IPDFViewerApplication | undefined;

  private originalConvertToRegExpString: any;

  public currentTab = 0;
  public customfindcomponentTab: string = 'sinceversion2130';
  public codeTab: string = 'htmltemplate';

  constructor() {
    const notificationService = this.notificationService;

    pdfDefaultOptions.findController = MyCustomFindController;
    effect(() => {
      this.pdfViewerApplication = notificationService.onPDFJSInitSignal();
    });
  }

  public pdfLoaded(): void {
    this.overideFindFeature();
  }

  public ngOnDestroy(): void {
    this.restoreFindFeature();
  }

  public findRegex(): void {
    this.dispatchFind('find');
  }

  public findNext(): void {
    this.dispatchFind('again', false);
  }

  public findPrevious(): void {
    this.dispatchFind('again', true);
  }

  public onUpdateFindMatchesCount(result: FindResultMatchesCount) {
    this.currentMatchNumber = result.current;
    this.totalMatches = result.total;
    this.cdr.detectChanges();
  }

  private overideFindFeature() {
    if (!this.pdfViewerApplication) {
      console.error('PDF Viewer Application is not initialized');
      return;
    }
    const findController = this.pdfViewerApplication.findController as any;

    this.originalConvertToRegExpString = findController._convertToRegExpString;
    findController._convertToRegExpString = (query: string, ...args: any[]) => {
      const { matchRegex } = findController.state;

      if (!matchRegex) return this.originalConvertToRegExpString.call(findController, query, ...args);
      return [false, query];
    };
  }

  private restoreFindFeature() {
    if (this.originalConvertToRegExpString) {
      if (this.pdfViewerApplication) {
        const findController = this.pdfViewerApplication.findController as any;
        findController._convertToRegExpString = this.originalConvertToRegExpString;
      }
    }
  }

  private dispatchFind(type: string, findPrevious = false): void {
    this.pdfViewerApplication?.eventBus.dispatch('find', {
      ...this.findOptions,
      query: this.searchtext,
      type,
      findPrevious,
      source: undefined,
    });
  }
}
