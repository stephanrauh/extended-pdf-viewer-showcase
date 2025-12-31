import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { IPDFViewerApplication, PasswordPrompt, pdfDefaultOptions, PDFNotificationService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CustomPasswordPrompt } from './custom-password-prompt';
import { FullscreenService } from '../../services/fullscreen.service';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-passwords',

  standalone: true,
  templateUrl: './passwords.component.html',
  styleUrls: ['./passwords.component.css'],
  imports: [FormsModule, Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, AsyncPipe],
})
export class PasswordsComponent {
  private cdr = inject(ChangeDetectorRef);
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  fullscreenService = inject(FullscreenService);

  public activeTab = 'html';

  public src = '/assets/pdfs/GraalVM-password-protected.pdf';

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
      this.cdr.markForCheck();
    });
  }

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor() {
    const notificationService = inject(PDFNotificationService);

    this.choice = 'graalvm-rocks!';

    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
    });
  }
}
