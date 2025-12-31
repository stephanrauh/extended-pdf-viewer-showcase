import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { NgxExtendedPdfViewerService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { ThemeService } from '../../services/theme.service';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { OpenInNewTabComponent } from './open-in-new-tab/open-in-new-tab.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-custom-toolbar',

    standalone: true,
    templateUrl: './custom-toolbar.component.html',
    styleUrls: ['./custom-toolbar.component.css'],
    imports: [
        FormsModule,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        OpenInNewTabComponent,
        AsyncPipe,
    ],
})
export class CustomToolbarComponent {
  private cdr = inject(ChangeDetectorRef);
  public fullscreenService = inject(FullscreenService);
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }

  public _toolbarVariant = 'additional';

  public showPdfViewer = true;

  public showFreeFloatingBar = true;

  public src = '/assets/pdfs/dachstein.pdf';

  public zoom = '100%';
  public customtoolbarcomponentTab: string = 'livedemo';
  public codeTab: string = 'typescript';

  private pdfViewerService = inject(NgxExtendedPdfViewerService);

  public set toolbarVariant(variant: string) {
    if (this._toolbarVariant !== variant) {
      this.showPdfViewer = false;
      this._toolbarVariant = variant;
      this.src =
        variant === 'findbar'
          ? '/assets/pdfs/GraalVM Dictionary Bytecode, Interpreters, C1 Compiler, C2 Compiler, CPUs, and More.pdf'
          : '/assets/pdfs/dachstein.pdf';
      setTimeout(() => {
        this.showPdfViewer = true;
        this.cdr.markForCheck();
      }, 100);
    } else {
      this._toolbarVariant = variant;
    }
  }

  public get toolbarVariant(): string {
    return this._toolbarVariant;
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
