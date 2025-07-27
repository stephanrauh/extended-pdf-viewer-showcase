import { NgxExtendedPdfViewerService, pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-editor-settings',
    
    standalone: true,
    templateUrl: './editor-settings.component.html',
    styleUrls: ['./editor-settings.component.css'],
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class EditorSettingsComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  private pdfViewerService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  public imageDataURL: string | undefined = undefined;

  public selectedTabIndex = 0;
  public editorsettingscomponentTab: string = 'htmltemplate';

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor() {
    pdfDefaultOptions.textLayerMode = 1;
  }

  public set editorFontSize(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorFontSize = Number(target?.value);
  }

  public set editorFontColor(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorFontColor = target?.value;
  }

  public set editorInkColor(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorInkColor = target?.value;
  }

  public set editorInkOpacity(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorInkOpacity = Number(target?.value);
  }

  public set editorInkThickness(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorInkThickness = Number(target?.value);
  }

  public set editorHighlightColor(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorHighlightColor = target?.value;
  }

  public set editorHighlightDefaultColor(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorHighlightDefaultColor = target?.value;
  }

  public set editorHighlightShowAll(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorHighlightShowAll = target.value == 'true';
  }

  public set editorHighlightThickness(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorHighlightThickness = Number(target?.value);
  }
}
