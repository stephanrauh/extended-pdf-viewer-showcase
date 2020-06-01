import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { PDFPrintRange } from '../../../../ngx-extended-pdf-viewer/projects/ngx-extended-pdf-viewer/src/lib/options/pdf-print-range';

@Component({
  selector: 'app-print-range',
  templateUrl: './print-range.component.html',
  styleUrls: ['./print-range.component.css'],
})
export class PrintRangeComponent {
  public from = 1;

  public to = 10;

  private _excluded = '2,4,6,8';

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

  constructor(private printService: NgxExtendedPdfViewerService) {}

  private static toArray(list: string): Array<number> | undefined {
    if (!list) {
      return undefined;
    }
    if (list.endsWith(",")) {
      return undefined;
    }
    try {
      const result = [...list.split(",").map(s => Number(s.trim()))];
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

  public get sourcecode(): string {
    return `@Component({ ... })
export class PrintRangeComponent {
  constructor(private printService: NgxExtendedPdfViewerService) {}

  public print(): void {
    const range = {
      ${this.from ? 'from: [' + this.from + '],': ''}
      ${this.to ? 'to: [' + this.to + '],': ''}
      ${this.excludedAsArray ? 'excluded: [' + this.excludedAsArray + '],': ''}
      ${this.includedAsArray ? 'included: [' + this.includedAsArray + '],': ''}
    } as PDFPrintRange;
    this.printService.print(range);
  }
}`;
  }
}
