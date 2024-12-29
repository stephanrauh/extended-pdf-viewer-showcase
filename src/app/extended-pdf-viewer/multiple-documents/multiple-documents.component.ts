import { Component, effect, OnInit } from '@angular/core';
import { FileInputChanged, IPDFViewerApplication, PDFNotificationService } from 'ngx-extended-pdf-viewer';
import { isBrowser } from '../common/utilities';

@Component({
  standalone: false,
  selector: 'app-multiple-documents',
  templateUrl: './multiple-documents.component.html',
  styleUrls: ['./multiple-documents.component.css']
})
export class MultipleDocumentsComponent implements OnInit {
  public src!: string;

  public dragAndDrop = true;

  private _fullscreen = false;

  public bookMode = false;
  private PDFViewerApplication?: IPDFViewerApplication;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;

  }

  public url!: URL;

  constructor(notificationService: PDFNotificationService) {
    if (isBrowser()) {
      this.url = new URL(`${location.protocol}//${location.host}/assets/pdfs/GraalVM.pdf`);
    } else {
      // use a dummy value for server-side rendering
      this.url = new URL(`http://localhost:4200/assets/pdfs/GraalVM.pdf`);
    }
    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
    });
  }

  public ngOnInit(): void {
    setTimeout(() => {
      this.PDFViewerApplication?.eventBus.on('fileinputchange', (event: FileInputChanged) => {
        queueMicrotask(() => {
          if (event.dropEvent) {
            console.log("Drop Event: ", event.dropEvent);
          } else {
            console.log("The file has changed without using drag and drop", event.fileInput);
          }
        });
      });
    }, 2000);
  }
}
