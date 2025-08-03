import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
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
        Ie11MarkdownComponent,
        CopyrightComponent,
        FullscreenButtonComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class PdfjsVersionsComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
    public pdfjsversionscomponentTab: string = 'aboutthebleedingedgebranch';
  public codeTab: string = 'typescript';
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
