import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService, PageRenderedEvent } from 'ngx-extended-pdf-viewer';
import { BlobService } from './blob.service';
import { FullscreenService } from '../../services/fullscreen.service';

@Component({
  standalone: false,
  selector: 'app-blob',
  templateUrl: './blob.component.html',
  styleUrls: ['./blob.component.css'],
})
export class BlobComponent {
  public src = this.blobService.src;

  public downloaded: string | undefined;

  private _fullscreen = false;

  public choice = 'preloaded';

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor(private http: HttpClient, private blobService: BlobService, private ngxService: NgxExtendedPdfViewerService, public fullscreenService: FullscreenService) {}

  public usePreloadedFile(): void {
    this.src = this.blobService.src;
  }

  public loadLargeFile(): void {
    this.http.get('/assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf', { responseType: 'blob' }).subscribe((res) => {
      this.src = res;
    });
  }

  public async downloadAsBlob(): Promise<void> {
    const blob = await this.ngxService.getCurrentDocumentAsBlob();
    if (blob) {
      this.downloaded = 'The BLOB contains ' + blob.size + ' byte.';
    } else {
      this.downloaded = 'download failed';
    }
  }

  public pageRendered($event: PageRenderedEvent) {
    console.log('pageRendered', $event, "Page", $event.pageNumber, "Scale: ", $event.source.scale);
  }
}
