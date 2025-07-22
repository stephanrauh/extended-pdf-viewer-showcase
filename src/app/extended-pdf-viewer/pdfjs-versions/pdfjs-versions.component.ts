import { Component, inject } from '@angular/core';
import { pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { CopyrightComponent } from '../common/copyright.component';
import { FullscreenButtonComponent } from '../../components/fullscreen-button/fullscreen-button.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-pdfjs-versions',
    
    standalone: true,
    templateUrl: './pdfjs-versions.component.html',
    styleUrls: ['./pdfjs-versions.component.css'],
    imports: [
        MatCard,
        MatTabGroup,
        MatTab,
        Ie11MarkdownComponent,
        CopyrightComponent,
        FullscreenButtonComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class PdfjsVersionsComponent {
  fullscreenService = inject(FullscreenService);

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor() {
    pdfDefaultOptions.assetsFolder = 'bleeding-edge';
  }
}
