import { Component, inject } from '@angular/core';
import { NgxExtendedPdfViewerService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatLabel } from '@angular/material/form-field';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { OpenInNewTabComponent } from './open-in-new-tab/open-in-new-tab.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-custom-toolbar',
    templateUrl: './custom-toolbar.component.html',
    styleUrls: ['./custom-toolbar.component.css'],
    imports: [
        MatCard,
        MatTabGroup,
        MatTab,
        MatLabel,
        MatRadioGroup,
        FormsModule,
        MatRadioButton,
        MatCheckbox,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        OpenInNewTabComponent,
        MatTooltip,
        MatIcon,
        AsyncPipe,
    ],
})
export class CustomToolbarComponent {
  public fullscreenService = inject(FullscreenService);

  public _theme = 'additional';

  public showPdfViewer = true;

  public showFreeFloatingBar = true;

  public src = '/assets/pdfs/dachstein.pdf';

  public zoom = '100%';

  private pdfViewerService = inject(NgxExtendedPdfViewerService);

  public set theme(theme: string) {
    if (this._theme !== theme) {
      this.showPdfViewer = false;
      this._theme = theme;
      this.src =
        theme === 'findbar'
          ? '/assets/pdfs/GraalVM Dictionary Bytecode, Interpreters, C1 Compiler, C2 Compiler, CPUs, and More.pdf'
          : '/assets/pdfs/dachstein.pdf';
      setTimeout(() => (this.showPdfViewer = true), 100);
    } else {
      this._theme = theme;
    }
  }

  public get theme(): string {
    return this._theme;
  }

  public onClick() {
    // important: this method is called from outside, hence this may be undefined!
    window.open('assets/pdfs/dachstein.pdf', '#');
  }

  public exportAsImage(): void {
    const scale = { width: 1000 };
    (async () => {
      const url = await this.pdfViewerService.getPageAsImage(1, scale, '#000000');
      if (url) {
        // Create a Blob from the data URL
        const byteString = atob(url.split(',')[1]);
        const mimeString = url.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });

        // Create an object URL from the Blob
        const blobUrl = URL.createObjectURL(blob);

        // Open the object URL in a new tab
        const newWindow = window.open(blobUrl, '_blank');

        // Revoke the object URL after the new window has loaded
        if (newWindow) {
          newWindow.onload = function () {
            URL.revokeObjectURL(blobUrl);
          };
        }
      }
    })();
  }
}
