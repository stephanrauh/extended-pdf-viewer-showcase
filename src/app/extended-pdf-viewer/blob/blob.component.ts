import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { NgxExtendedPdfViewerService, PageRenderedEvent, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { BlobService } from './blob.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-blob',

    standalone: true,
    templateUrl: './blob.component.html',
    styleUrls: ['./blob.component.css'],
    imports: [
        FormsModule,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class BlobComponent {

  private cdr = inject(ChangeDetectorRef);

  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  private http = inject(HttpClient);
  private blobService = inject(BlobService);
  private ngxService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  public src = this.blobService.src;

  public downloaded: string | undefined;

  private _fullscreen = false;

  public choice = 'preloaded';
  public blobcomponentTab: string = 'displayingblobs';
  public codeTab: string = 'htmltemplate';

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public usePreloadedFile(): void {
    this.src = this.blobService.src;
  }

  public loadLargeFile(): void {
    this.http.get('/assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf', { responseType: 'blob' }).subscribe((res) => {
      this.src = res;
      this.cdr.markForCheck();
    });
  }

  public async downloadAsBlob(): Promise<void> {
    const blob = await this.ngxService.getCurrentDocumentAsBlob();
    if (blob) {
      this.downloaded = 'The BLOB contains ' + blob.size + ' byte.';
    } else {
      this.downloaded = 'download failed';
    }
    this.cdr.markForCheck();
  }

  public pageRendered($event: PageRenderedEvent) {
    console.log('pageRendered', $event, "Page", $event.pageNumber, "Scale: ", $event.source.scale);
  }
}
