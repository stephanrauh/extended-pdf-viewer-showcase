import { Component, OnInit, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { pdfData2 } from './secondPdfBase64';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { isBrowser } from '../common/utilities';
import { PageRenderedEvent, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-base64',

  standalone: true,
  templateUrl: './base64.component.html',
  styleUrls: ['./base64.component.css'],
  imports: [Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, AsyncPipe],
})
export class Base64Component implements OnInit {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  private httpClient = inject(HttpClient);
  fullscreenService = inject(FullscreenService);

  public base64 = new Subject<string>();

  public tailwindPdf!: string;

  public firstPdf = true;
  public activeTab: string = 'html';

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public ngOnInit(): void {
    if (isBrowser()) {
      this.httpClient
        .get('/assets/pdfs/Bootstrap-vs-Material-Design-vs-Prime-vs-Tailwind.base64.txt', { responseType: 'text' as 'json' })
        .pipe(
          tap((base64) => (this.tailwindPdf = base64 as string)),
          tap((base64) => this.base64.next(base64 as string)),
        )
        .subscribe();
    }
  }

  public toggle(): void {
    if (this.firstPdf) {
      this.base64.next(pdfData2);
    } else {
      this.base64.next(this.tailwindPdf);
    }
    this.firstPdf = !this.firstPdf;
  }

  public onPdfLoaded(event: unknown): void {
    console.log('onPdfLoaded', event);
  }

  public pageRendered($event: PageRenderedEvent) {
    console.log('pageRendered', $event, 'Page', $event.pageNumber, 'Scale: ', $event.source.scale);
  }
}
