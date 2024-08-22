import { Component, effect, OnDestroy } from '@angular/core';
import { IPDFViewerApplication, NgxExtendedPdfViewerService, PDFNotificationService } from 'ngx-extended-pdf-viewer';
import { PDFPrintRange } from 'ngx-extended-pdf-viewer';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-print-range',
  templateUrl: './print-range.component.html',
  styleUrls: ['./print-range.component.css'],
})
export class PrintRangeComponent implements OnDestroy {
  private activeTab: number = 0;
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

  constructor(private printService: NgxExtendedPdfViewerService, private snackBar: MatSnackBar, notificationService: PDFNotificationService) {
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

  private static toArray(list: string): Array<number> | undefined {
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
    this.snackBar.open(message ?? 'Click the print button or hit CTRL+P to see the effect. If you are using a Mac, the key binding is CMD+P.', 'OK', {
      duration: 5000,
    });
  }

  public tabChanged(index: MatTabChangeEvent) {
    this.activeTab = index.index;
    if (this.activeTab === 3) {
      this.printService.removePrintRange();
    }
  }

  public get sourcecode(): string {
    if (this.activeTab === 0) {
      return `@Component({ ... })
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
      return `@Component({ ... })
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
      return `@Component({ ... })
export class PrintComponent {
  public replaceBrowserPrint = ${this.replaceBrowserPrint};
  }
}`;
    }
  }

  public ngOnDestroy(): void {
    this.printService.removePrintRange();
    this.PDFViewerApplication = undefined;
  }
}
