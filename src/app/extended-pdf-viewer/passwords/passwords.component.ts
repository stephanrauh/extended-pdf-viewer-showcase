import { Component } from '@angular/core';
import { IPDFViewerApplication, NgxExtendedPdfViewerService, PasswordPrompt, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';
import { CustomPasswordPrompt } from './custom-password-prompt';

@Component({
  selector: 'app-passwords',
  templateUrl: './passwords.component.html',
  styleUrls: ['./passwords.component.css'],
})
export class PasswordsComponent {

  public src!: string;

  public password = "graalvm-rocks!";

  private _choice: string | undefined = undefined;

  private originalPasswordPrompt!: PasswordPrompt;

  public isLocalhost = isLocalhost();

  public get choice() {
    return this._choice;
  }

  public set choice(choice: string | undefined) {
    this._choice = choice;
    (this.password as any) = choice;
    (this.src as any) = undefined;
    if (choice === 'graalvm-sucks?') {
      const PDFViewerApplication: IPDFViewerApplication = (window as any).PDFViewerApplication;
      if (!this.originalPasswordPrompt) {
        this.originalPasswordPrompt = PDFViewerApplication.passwordPrompt;
      }
      pdfDefaultOptions.passwordPrompt = new CustomPasswordPrompt();
      PDFViewerApplication.passwordPrompt = new CustomPasswordPrompt();
    } else {
      if (this.originalPasswordPrompt) {
        pdfDefaultOptions.passwordPrompt = this.originalPasswordPrompt;
        const PDFViewerApplication: IPDFViewerApplication = (window as any).PDFViewerApplication;
        PDFViewerApplication.passwordPrompt = this.originalPasswordPrompt;
      }
    }
    setTimeout(() => {
      this.src = '/assets/pdfs/GraalVM-password-protected.pdf';
    },200);
  }

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.pdfService.recalculateSize());
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {
    this.choice = "graalvm-rocks!";
  }
}
