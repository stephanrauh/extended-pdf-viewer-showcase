import { Component, effect, OnInit, inject } from '@angular/core';
import { FileInputChanged, IPDFViewerApplication, PDFNotificationService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { isBrowser } from '../common/utilities';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { FullscreenButtonComponent } from '../../components/fullscreen-button/fullscreen-button.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-multiple-documents',
    templateUrl: './multiple-documents.component.html',
    styleUrls: ['./multiple-documents.component.css'],
    imports: [MatCard, MatFormField, MatLabel, MatSelect, MatOption, MatCheckbox, FormsModule, MatTabGroup, MatTab, Ie11MarkdownComponent, FullscreenButtonComponent, NgxExtendedPdfViewerModule, AsyncPipe]
})
export class MultipleDocumentsComponent implements OnInit {
  fullscreenService = inject(FullscreenService);

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

  constructor() {
    const notificationService = inject(PDFNotificationService);

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
