import { Component, effect } from '@angular/core';
import { IPDFViewerApplication, PasswordPrompt, pdfDefaultOptions, PDFNotificationService } from 'ngx-extended-pdf-viewer';
import { CustomPasswordPrompt } from './custom-password-prompt';

@Component({
standalone: false,
  selector: 'app-passwords',
  templateUrl: './passwords.component.html',
  styleUrls: ['./passwords.component.css'],
})
export class PasswordsComponent {

  public src: string = '/assets/pdfs/GraalVM-password-protected.pdf';

  public password: string | undefined = undefined;

  private _choice: string | undefined = undefined;

  private originalPasswordPrompt!: PasswordPrompt;


  private PDFViewerApplication?: IPDFViewerApplication;

  public get choice() {
    return this._choice;
  }

  public set choice(choice: string | undefined) {
    if (!this.PDFViewerApplication) {
      return;
    }
    this._choice = choice;
    (this.password as any) = choice;
    (this.src as any) = undefined;
    if (choice === 'graalvm-sucks?') {
      if (!this.originalPasswordPrompt) {
        this.originalPasswordPrompt = this.PDFViewerApplication.passwordPrompt;
      }
      pdfDefaultOptions.passwordPrompt = new CustomPasswordPrompt();
      this.PDFViewerApplication.passwordPrompt = new CustomPasswordPrompt();
    } else {
      if (this.originalPasswordPrompt) {
        pdfDefaultOptions.passwordPrompt = this.originalPasswordPrompt;
        this.PDFViewerApplication.passwordPrompt = this.originalPasswordPrompt;
      }
    }
    setTimeout(() => {
      this.src = '/assets/pdfs/GraalVM-password-protected.pdf';
    });
  }

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;

  }

  constructor(notificationService: PDFNotificationService) {
    this.choice = "graalvm-rocks!";

    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
    });
  }
}
