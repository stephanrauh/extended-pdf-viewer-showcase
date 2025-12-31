import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-signatures',
    
    standalone: true,
    templateUrl: './signatures.component.html',
    styleUrls: ['./signatures.component.css'],
    imports: [
        FormsModule,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class SignaturesComponent {
  private cdr = inject(ChangeDetectorRef);
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  fullscreenService = inject(FullscreenService);

  private _showSignature = true;

  public showPdf = true;
  public signaturescomponentTab: string = 'signatureswithoutverification';
  public codeTab: string = 'htmltemplate';

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public get showSignature(): boolean {
    return this._showSignature;
  }

  public set showSignature(show: boolean) {
    this._showSignature = show;
    this.showPdf = false;
    setTimeout(() => {
      this.showPdf = true;
      this.cdr.markForCheck();
    }, 100);
  }

  constructor() {
    pdfDefaultOptions.enableSignatureEditor = true;
  }
}
