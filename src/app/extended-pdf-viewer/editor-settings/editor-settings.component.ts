import { NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-editor-settings',
  templateUrl: './editor-settings.component.html',
  styleUrls: ['./editor-settings.component.css'],
})
export class EditorSettingsComponent {
  public imageDataURL: string | undefined = undefined;

  public selectedTabIndex = 0;

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor(private pdfViewerService: NgxExtendedPdfViewerService) {
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
