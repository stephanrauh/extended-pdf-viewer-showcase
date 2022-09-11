import { NgxExtendedPdfViewerService, PageRenderedEvent, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { Component, ViewEncapsulation } from '@angular/core';
import { TextLayerRenderedEvent } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-textlayer',
  templateUrl: './textlayer.component.html',
  styleUrls: ['./textlayer.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TextlayerComponent {
  public _markLongWords = false;

  private _showBoxes = false;

  private _showTextLayer = false;

  private alreadyRendered: Array<HTMLSpanElement> = [];

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.pdfService.recalculateSize());
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {
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
    event.source.textDivs.forEach((span) => {
      this.alreadyRendered.push(span);
    });

    if (this.showTextLayer) {
      event.source.textDivs.forEach((span) => {
        span.classList.add('box');
      });
    }
    if (this._markLongWords) {
      event.source.textDivs.forEach((span) => {
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
