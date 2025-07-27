import { PageRenderedEvent, pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { Component, ViewEncapsulation, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { TextLayerRenderedEvent } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-textlayer',

  standalone: true,
  templateUrl: './textlayer.component.html',
  styleUrls: ['./textlayer.component.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [FormsModule, Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, AsyncPipe],
})
export class TextlayerComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  fullscreenService = inject(FullscreenService);

  public activeTab = 'html';

  public _markLongWords = false;

  private _showBoxes = false;

  private _showTextLayer = false;

  private alreadyRendered: HTMLSpanElement[] = [];

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

  public get showBoxes(): boolean {
    return this._showBoxes;
  }

  public set showBoxes(show: boolean) {
    if (show) {
      this.alreadyRendered.forEach((span) => {
        span.classList.add('box');
      });
    } else {
      this.alreadyRendered.forEach((span) => {
        span.classList.remove('box');
      });
    }
  }

  public get markLongWords(): boolean {
    return this._markLongWords;
  }

  public set markLongWords(mark: boolean) {
    this._markLongWords = mark;
    this.alreadyRendered.forEach((span) => this.doMarkLongWordsInSpan(span));
  }

  public doMarkLongWordsInSpan(span: HTMLSpanElement): void {
    if (!this._markLongWords) {
      span.innerHTML = span.innerText.replace('\n', '');
    } else {
      const withMarks = span.innerText
        .split(' ')
        .map((t) => this.markOneLongWord(t))
        .join(' ');
      span.innerHTML = withMarks;
    }
  }

  private markOneLongWord(word: string): string {
    if (word.length > 6) {
      return `<div class="long-word">${word}</div>`;
    }
    return word;
  }

  public get showTextLayer(): boolean {
    return this._showTextLayer;
  }

  public set showTextLayer(layer: boolean) {
    this._showTextLayer = layer;
    const divs = document.getElementsByClassName('textLayer');
    for (let i = 0; i < divs.length; i++) {
      const div = divs.item(i);
      if (div) {
        if (layer) {
          div.classList.add('show-text-layer');
        } else {
          div.classList.remove('show-text-layer');
        }
      }
    }
  }

  public highlightWords(event: TextLayerRenderedEvent): void {
    (event as any).source.textLayer.highlighter.textDivs.forEach((span) => {
      this.alreadyRendered.push(span);
    });

    if (this.showTextLayer) {
      (event as any).source.textLayer.highlighter.textDivs.forEach((span) => {
        span.classList.add('box');
      });
    }
    if (this._markLongWords) {
      (event as any).source.textLayer.highlighter.textDivs.forEach((span) => {
        this.doMarkLongWordsInSpan(span);
      });
    }
  }

  public pageRendered(event: PageRenderedEvent): void {
    console.log('text layer mode', event.source['textLayerMode']);
  }

  public textLayerRendered($event: TextLayerRenderedEvent): void {
    console.log('textLayerRendered');
  }
}
