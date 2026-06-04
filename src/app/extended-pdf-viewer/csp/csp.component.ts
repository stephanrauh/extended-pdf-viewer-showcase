import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { PageRenderedEvent, PdfLoadedEvent, pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { isBrowser } from '../common/utilities';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';

const WARMUP_SRC = './assets/pdfs/blank.pdf';
const ARXIV_SRC = './assets/pdfs/2404.00465v1.pdf';
const JBIG2_SRC = './assets/pdfs/jbig2-demo.pdf';

@Component({
    selector: 'app-csp',

    standalone: true,
    templateUrl: './csp.component.html',
    styleUrls: ['./csp.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        RouterLink,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective,
    ],
})
export class CSPComponent implements OnInit, OnDestroy {
  private readonly themeService = inject(ThemeService);
  private readonly route = inject(ActivatedRoute);

  public get theme(): string {
    return this.themeService.theme();
  }
   public _useInlineScripts = false;
   public _useWasm = true;
  public cspcomponentTab: 'activating' | 'gettingstarted' | 'wasm' = 'activating';
  public codeTab: 'htmltemplate' | 'tscode' | 'indexhtml' | 'maints' = 'indexhtml';

  public viewerSrc: string = WARMUP_SRC;

  private readonly cdr = inject(ChangeDetectorRef);
  private loadStart = 0;
  public firstPageRenderMs: number | undefined;
  private routeSub?: Subscription;

  // 'warmup' → blank.pdf loading,
  // 'switching' → blank loaded, test PDF in flight (clock started),
  // 'ready' → test PDF parsed, awaiting first-page render,
  // 'measured' → first page rendered (or benchmark complete).
  private phase: 'warmup' | 'switching' | 'ready' | 'measured' = 'warmup';

  public benchmarkRunning = false;
  public benchmarkSamples: number[] = [];
  public readonly benchmarkIterations = 5;

  constructor() {
    if (isBrowser()) {
      const urlParams = new URLSearchParams(globalThis.location.search);
      this._useInlineScripts = urlParams.get('useInlineScripts') === 'true';
      this._useWasm = urlParams.get('useWasm') !== 'false';
      pdfDefaultOptions.rangeChunkSize = 1024 * 1024;
      pdfDefaultOptions.useWasm = this._useWasm;
    }
  }

  private static readonly VARIANT_TO_TAB: Record<string, 'activating' | 'gettingstarted' | 'wasm'> = {
    'webassembly': 'wasm',
    'inline-scripts': 'gettingstarted',
    'activating-csp': 'activating',
  };

  public ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const variant = params.get('variant') ?? '';
      const next = CSPComponent.VARIANT_TO_TAB[variant] ?? 'activating';
      if (this.cspcomponentTab === next) return;
      this.cspcomponentTab = next;
      this.codeTab = next === 'activating' ? 'indexhtml' : 'htmltemplate';
      this.resetMeasurement();
    });
  }

  private targetSrc(): string {
    return this.cspcomponentTab === 'wasm' ? JBIG2_SRC : ARXIV_SRC;
  }

  private resetMeasurement() {
    this.firstPageRenderMs = undefined;
    this.benchmarkSamples = [];
    this.benchmarkRunning = false;
    this.phase = 'warmup';
    this.viewerSrc = WARMUP_SRC;
    this.cdr.markForCheck();
  }

  public startBenchmark() {
    this.benchmarkRunning = true;
    this.benchmarkSamples = [];
    this.firstPageRenderMs = undefined;
    this.phase = 'warmup';
    this.viewerSrc = WARMUP_SRC;
    this.cdr.markForCheck();
  }

  public onPdfLoaded(_event: PdfLoadedEvent) {
    if (this.phase === 'warmup' && this.viewerSrc === WARMUP_SRC) {
      // blank.pdf finished loading — start the clock and switch to the test PDF.
      this.phase = 'switching';
      this.loadStart = performance.now();
      this.viewerSrc = this.targetSrc();
      this.cdr.markForCheck();
      return;
    }
    if (this.phase === 'switching') {
      // test PDF finished parsing — now wait for its first page render.
      this.phase = 'ready';
      this.cdr.markForCheck();
    }
  }

  public onPageRendered(event: PageRenderedEvent) {
    if (this.phase !== 'ready' || event.pageNumber !== 1) return;
    const elapsed = Math.round(performance.now() - this.loadStart);
    this.firstPageRenderMs = elapsed;

    if (this.benchmarkRunning) {
      this.benchmarkSamples = [...this.benchmarkSamples, elapsed];
      if (this.benchmarkSamples.length >= this.benchmarkIterations) {
        this.benchmarkRunning = false;
        this.phase = 'measured';
      } else {
        this.phase = 'warmup';
        this.viewerSrc = WARMUP_SRC;
      }
    } else {
      this.phase = 'measured';
    }
    this.cdr.markForCheck();
  }

  public get benchmarkMedian(): number | undefined {
    const n = this.benchmarkSamples.length;
    if (n === 0) return undefined;
    const sorted = [...this.benchmarkSamples].sort((a, b) => a - b);
    const mid = Math.floor(n / 2);
    return n % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
  }

  public get benchmarkMin(): number | undefined {
    return this.benchmarkSamples.length === 0 ? undefined : Math.min(...this.benchmarkSamples);
  }

  public get benchmarkMax(): number | undefined {
    return this.benchmarkSamples.length === 0 ? undefined : Math.max(...this.benchmarkSamples);
  }

  public get useInlineScripts() {
    return this._useInlineScripts;
  }

  public set useInlineScripts(value: boolean) {
    if (!isBrowser()) return;
    this._useInlineScripts = value;
    location.search = `useInlineScripts=${value}&useWasm=${this._useWasm}`;
  }

  public get useWasm() {
    return this._useWasm;
  }

  public set useWasm(value: boolean) {
    if (!isBrowser()) return;
    this._useWasm = value;
    location.search = `useInlineScripts=${this._useInlineScripts}&useWasm=${value}`;
  }

  public ngOnDestroy() {
    this.routeSub?.unsubscribe();
    pdfDefaultOptions.rangeChunkSize = 64 * 1024; // restore the default value
    pdfDefaultOptions.useWasm = true; // restore the default value
  }
}
