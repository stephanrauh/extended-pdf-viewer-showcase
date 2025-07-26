import { Component, effect, OnDestroy, inject } from '@angular/core';
import { IPDFViewerApplication, NgxExtendedPdfViewerService, PDFNotificationService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PDFPrintRange } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';
import { LanguagePipe } from 'ngx-markdown';

@Component({
    selector: 'app-print-range',
    
    standalone: true,
    templateUrl: './print-range.component.html',
    styleUrls: ['./print-range.component.css'],
    imports: [
        FormsModule,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
        LanguagePipe,
    ],
})
export class PrintRangeComponent implements OnDestroy {
  private printService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  public printrangecomponentTab: string = 'printserviceprint';
  public codeTab: string = 'typescript';
  private activeTab = 0;
  private PDFViewerApplication?: IPDFViewerApplication;

  public get src(): string {
    if (this.activeTab === 3) {
      return 'assets/pdfs/fancy.pdf';
    }
    return '/assets/pdfs/BootsFaces_Deep_Dive_1.0.pdf';
  }

  public from = 1;

  public to = 10;

  private _excluded = '2,4,6,8';

  private _fullscreen = false;

  private _printResolution = 150;
  public resolution = '';

  public get printResolution() {
    return this._printResolution;
  }
  public set printResolution(value) {
    if (value >= 300) {
      this.from = 1;
      this.to = 3;
      this.excluded = '';
      this.setPrintRange('Reduced the print range to 3 pages because printing is slow at higher resolutions.');
    }
    this._printResolution = value;
  }

  public replaceBrowserPrint = true;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public get excluded(): string {
    return this._excluded;
  }

  public set excluded(ex: string) {
    this._excluded = ex;
    this.excludedAsArray = PrintRangeComponent.toArray(this.excluded);
  }

  public excludedAsArray = PrintRangeComponent.toArray(this.excluded);

  public _included = '';

  public enablePrintAutoRotate = true;

  public get included(): string {
    return this._included;
  }

  public set included(ex: string) {
    this._included = ex;
    this.includedAsArray = PrintRangeComponent.toArray(this.included);
  }

  public includedAsArray = PrintRangeComponent.toArray(this.included);

  constructor() {
    const notificationService = inject(PDFNotificationService);

    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
      if (this.PDFViewerApplication) {
        this.init(this.PDFViewerApplication);
      }
    });
  }

  public init(PDFViewerApplication: IPDFViewerApplication): void {
    if (PDFViewerApplication?.ngxConsole) {
      PDFViewerApplication.ngxConsole.ngxConsoleFilter = (level: string, message: any): boolean => {
        if (message?.includes && message?.includes('The resolution is now ')) {
          const index = message.indexOf('The resolution is now ') + 'The resolution is now '.length;
          this.resolution = message.substring(index);
          return true;
        }
        return true;
      };
    }
  }

  private static toArray(list: string): number[] | undefined {
    if (!list) {
      return undefined;
    }
    if (list.endsWith(',')) {
      return undefined;
    }
    try {
      const result = [...list.split(',').map((s) => Number(s.trim()))];
      return result;
    } catch (e) {
      return undefined;
    }
  }

  public print(): void {
    const range = {
      from: this.from,
      to: this.to,
      excluded: this.excludedAsArray,
      included: this.includedAsArray,
    } as PDFPrintRange;
    this.printService.print(range);
  }

  public setPrintRange(message?: string): void {
    const range = {
      from: this.from,
      to: this.to,
      excluded: this.excludedAsArray,
      included: this.includedAsArray,
    } as PDFPrintRange;
    this.printService.setPrintRange(range);
    // Note: Snackbar functionality removed due to Material dependency removal
    console.log(message ?? 'Click the print button or hit CTRL+P to see the effect. If you are using a Mac, the key binding is CMD+P.');
  }

  public tabChanged(index: any) {
    this.activeTab = index.index;
    if (this.activeTab === 3) {
      this.printService.removePrintRange();
    }
  }

  public get sourcecode(): string {
    if (this.activeTab === 0) {
      return `@Component({
standalone: false,  ... })
export class PrintRangeComponent {
  constructor(private printService: NgxExtendedPdfViewerService) {}

  public print(): void {
    const range = {
      ${this.from ? 'from: [' + this.from + '],' : ''}
      ${this.to ? 'to: [' + this.to + '],' : ''}
      ${this.excludedAsArray ? 'excluded: [' + this.excludedAsArray + '],' : ''}
      ${this.includedAsArray ? 'included: [' + this.includedAsArray + '],' : ''}
    } as PDFPrintRange;
    this.printService.print(range);
}`.replaceAll('      \n', '');
    } else if (this.activeTab === 1) {
      return `@Component({
standalone: false,  ... })
export class PrintRangeComponent {
  constructor(private printService: NgxExtendedPdfViewerService) {}

  public setPrintRange(): void {
  const range = {
    ${this.from ? 'from: [' + this.from + '],' : ''}
    ${this.to ? 'to: [' + this.to + '],' : ''}
    ${this.excludedAsArray ? 'excluded: [' + this.excludedAsArray + '],' : ''}
    ${this.includedAsArray ? 'included: [' + this.includedAsArray + '],' : ''}
  } as PDFPrintRange;
  this.printService.setPrintRange(range);
  }
}`;
    } else {
      return `@Component({
standalone: false,  ... })
export class PrintComponent {
  }
}`;
    }
  }

  public ngOnDestroy(): void {
    this.printService.removePrintRange();
    this.PDFViewerApplication = undefined;
  }
}
