import { Component, OnDestroy } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { PDFPrintRange } from 'ngx-extended-pdf-viewer';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-print-range',
  templateUrl: './print-range.component.html',
  styleUrls: ['./print-range.component.css'],
})
export class PrintRangeComponent implements OnDestroy {
  private programmaticAPI = true;

  public from = 1;

  public to = 10;

  private _excluded = '2,4,6,8';

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() =>
    this.printService.recalculateSize());
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

  public get included(): string {
    return this._included;
  }

  public set included(ex: string) {
    this._included = ex;
    this.includedAsArray = PrintRangeComponent.toArray(this.included);
  }

  public includedAsArray = PrintRangeComponent.toArray(this.included);

  constructor(
    private printService: NgxExtendedPdfViewerService,
    private snackBar: MatSnackBar
  ) {}

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

  public setPrintRange(): void {
    const range = {
      from: this.from,
      to: this.to,
      excluded: this.excludedAsArray,
      included: this.includedAsArray,
    } as PDFPrintRange;
    this.printService.setPrintRange(range);
    this.snackBar.open(
      'Click the print button or hit CTRL+P to see the effect. If you are using a Mac, the key binding is CMD+P.',
      'OK',
      {
        duration: 5000,
      }
    );
  }

  public tabChanged(index: MatTabChangeEvent) {
    this.programmaticAPI = index.index === 0;
  }

  public get sourcecode(): string {
    if (this.programmaticAPI) {
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
  }
}`;
    } else {
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
    }
  }

  public ngOnDestroy(): void {
    this.printService.removePrintRange();
  }
}
