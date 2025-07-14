import { NgxExtendedPdfViewerService, pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { Component, inject } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-editor-settings',
    templateUrl: './editor-settings.component.html',
    styleUrls: ['./editor-settings.component.css'],
    imports: [
        MatCard,
        MatFormField,
        MatLabel,
        MatInput,
        MatTabGroup,
        MatTab,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class EditorSettingsComponent {
  private pdfViewerService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  public imageDataURL: string | undefined = undefined;

  public selectedTabIndex = 0;

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
