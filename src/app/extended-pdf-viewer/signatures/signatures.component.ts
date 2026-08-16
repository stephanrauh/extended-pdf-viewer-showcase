import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import {
  pdfDefaultOptions,
  NgxExtendedPdfViewerModule,
  PdfSignatureCertificate,
  PdfSignatureStatus,
  PdfSignatureToVerify,
  PdfSignatureVerificationResult,
  PdfSignatureVerifier,
} from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
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
        NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective,
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
    this.reloadViewer();
  }

  /**
   * The status the demo verifier reports. It is a dropdown because the panel
   * renders each status differently - that's the only thing this demo shows.
   */
  private _demoStatus: PdfSignatureStatus = 'untrusted';

  public get demoStatus(): PdfSignatureStatus {
    return this._demoStatus;
  }

  public set demoStatus(status: PdfSignatureStatus) {
    this._demoStatus = status;
    this.reloadViewer();
  }

  private _useVerifier = true;

  public get useVerifier(): boolean {
    return this._useVerifier;
  }

  public set useVerifier(use: boolean) {
    this._useVerifier = use;
    this.reloadViewer();
  }

  /**
   * A STUB. It performs no cryptography whatsoever - it reports whatever the
   * dropdown says. A real implementation has to parse the PKCS#7 blob in
   * `signature.pkcs7`, check it against `signature.data`, and - the hard part -
   * decide which root certificates it trusts.
   */
  public readonly demoVerifier: PdfSignatureVerifier = {
    verify: (signature: PdfSignatureToVerify): Promise<PdfSignatureVerificationResult> =>
      Promise.resolve({
        status: this._demoStatus,
        errorCode: this._demoStatus === 'untrusted' ? 'DEMO_NO_TRUST_STORE' : null,
        message: `This is a demo. No signature was checked; the viewer only reports what this page told it to report. (SubFilter: ${signature.subFilter ?? 'unknown'})`,
        certificate: {
          subjectCN: 'Demo Signer (not verified)',
          issuerCN: 'pdfviewer.net demo - not a certificate authority',
        },
        documentModifiedAfterSigning: false,
      }),
    viewCertificate: (certificate: PdfSignatureCertificate): void => {
      // A real application opens its own dialog here. This demo just reports the
      // callback fired - deliberately not alert(), which would block the viewer.
      this.certificateClick = `viewCertificate() was called for "${certificate.subjectCN}". Your application decides what to show.`;
      this.cdr.markForCheck();
    },
  };

  /** Set by the demo verifier's viewCertificate() callback. */
  public certificateClick = '';

  /** The verifier is read once, when the document loads - so re-create the viewer. */
  private reloadViewer(): void {
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
