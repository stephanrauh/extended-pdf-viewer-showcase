import { Component, inject } from '@angular/core';
import { pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-signatures',
    templateUrl: './signatures.component.html',
    styleUrls: ['./signatures.component.css'],
    imports: [
        MatCard,
        MatTabGroup,
        MatTab,
        MatCheckbox,
        FormsModule,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class SignaturesComponent {
  fullscreenService = inject(FullscreenService);

  private _showSignature = true;

  public showPdf = true;

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
    setTimeout(() => (this.showPdf = true), 100);
  }

  constructor() {
    pdfDefaultOptions.enableSignatureEditor = true;
  }
}
