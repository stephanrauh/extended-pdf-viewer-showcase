import { ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  FindResultMatchesCount,
  FindState,
  NgxExtendedPdfViewerModule,
  NgxExtendedPdfViewerService,
} from 'ngx-extended-pdf-viewer';

/**
 * Reproduction of stephanrauh/ngx-extended-pdf-viewer#3210.
 *
 * Mirrors the reporter's gist (https://gist.github.com/HarshSuthar05/4b37c7cd6c260597756b6a967d19858d)
 * without Ionic/Capacitor: a [customFindbarButtons] template containing a
 * custom `<input id="findInput">`, a 250 ms debounced call to
 * `NgxExtendedPdfViewerService.find(text, { highlightAll: true })`, and the
 * (updateFindMatchesCount) event wired to a visible counter so a Playwright
 * test can assert total > 0.
 */
@Component({
  selector: 'app-find-custom-findbar',
  standalone: true,
  templateUrl: './find-custom-findbar.component.html',
  styleUrls: ['./find-custom-findbar.component.css'],
  imports: [FormsModule, NgxExtendedPdfViewerModule],
})
export class FindCustomFindbarComponent implements OnDestroy {
  public pdfPath = '/assets/pdfs/dummy-manual.pdf';

  public searchText = '';
  public searchCounterText = '';
  public searchHasNoMatch = false;
  public currentMatch = 0;
  public totalMatches = 0;

  private readonly searchSubject$ = new Subject<string>();
  private searchSubscription: Subscription;
  private currentFindState: FindState | undefined;
  private readonly SEARCH_DEBOUNCE_MS = 250;

  private readonly pdfViewerService = inject(NgxExtendedPdfViewerService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.searchSubscription = this.searchSubject$
      .pipe(debounceTime(this.SEARCH_DEBOUNCE_MS), distinctUntilChanged())
      .subscribe((text) => this.executeSearch(text));
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  public onSearchInput(): void {
    this.searchSubject$.next(this.searchText);
    if (!this.searchText) {
      this.searchCounterText = '';
      this.searchHasNoMatch = false;
    }
  }

  private executeSearch(text: string): void {
    if (!text) {
      this.searchCounterText = '';
      this.searchHasNoMatch = false;
      return;
    }
    this.pdfViewerService.find(text, { highlightAll: true });
  }

  public findNext(): void {
    this.pdfViewerService.findNext();
  }

  public findPrevious(): void {
    this.pdfViewerService.findPrevious();
  }

  public onUpdateFindMatchesCount(event: FindResultMatchesCount): void {
    this.currentMatch = Number(event?.current ?? 0);
    this.totalMatches = Number(event?.total ?? 0);

    if (this.totalMatches === 0) {
      this.searchCounterText = '';
      this.searchHasNoMatch = !!this.searchText;
      this.cdr.markForCheck();
      return;
    }

    if (this.currentFindState === FindState.NOT_FOUND) {
      this.cdr.markForCheck();
      return;
    }

    this.searchHasNoMatch = false;
    this.searchCounterText = `${this.currentMatch}/${this.totalMatches}`;
    this.cdr.markForCheck();
  }

  public onUpdateFindState(state: FindState): void {
    this.currentFindState = state;
    if (state === FindState.NOT_FOUND) {
      this.searchCounterText = '';
      this.searchHasNoMatch = !!this.searchText;
    } else {
      this.searchHasNoMatch = false;
    }
    this.cdr.markForCheck();
  }
}
