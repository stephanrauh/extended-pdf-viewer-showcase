import { Component, ChangeDetectionStrategy } from '@angular/core';
import { pdfData2 } from './secondPdfBase64';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-base64',
  templateUrl: './base64.component.html',
  styleUrls: ['./base64.component.css'],
})
export class Base64Component {
  public base64 = new Subject<string>();

  public tailwindPdf!: string;

  public firstPdf = true;

    private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() =>
    this.pdfService.recalculateSize());
  }

  constructor(private httpClient: HttpClient, private pdfService: NgxExtendedPdfViewerService) {}

  public ngOnInit(): void {
    this.httpClient
      .get(
        '/assets/pdfs/Bootstrap-vs-Material-Design-vs-Prime-vs-Tailwind.base64.txt',
        { responseType: 'text' as 'json' }
      )
      .pipe(
        tap((base64) => (this.tailwindPdf = base64 as string)),
        tap((base64) => (this.base64.next(base64 as string))),
      )
      .subscribe();
  }

  public toggle(): void {
    if (this.firstPdf) {
      this.base64.next(pdfData2);
    } else {
      this.base64.next(this.tailwindPdf);
    }
    this.firstPdf = !this.firstPdf;
  }
}
