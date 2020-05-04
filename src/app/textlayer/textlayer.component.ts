import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TextLayerRenderedEvent } from '../../../../ngx-extended-pdf-viewer/projects/ngx-extended-pdf-viewer/src/lib/events/textlayer-rendered';

@Component({
  selector: 'app-textlayer',
  templateUrl: './textlayer.component.html',
  styleUrls: ['./textlayer.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TextlayerComponent implements OnInit {
  public markLongWords = false;

  private _showBoxes = false;

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

  private _showTextLayer = false;

  private alreadyRendered: Array<HTMLSpanElement> = [];

  public get showTextLayer(): boolean {
    return this._showTextLayer;
  }

  public set showTextLayer(layer: boolean) {
    this._showTextLayer = layer;
    const divs = document.getElementsByClassName('textLayer');
    for (let i = 0; i < divs.length; i++) {
      const div = divs.item(i);
      if (layer) {
        div.classList.add('show-text-layer');
      } else {
        div.classList.remove('show-text-layer');
      }
    }
  }

  constructor() {}

  ngOnInit() {}

  public highlightWords(event: TextLayerRenderedEvent): void {
    event.source.textDivs.forEach((span) => {
      this.alreadyRendered.push(span);
    });

    if (this.showTextLayer) {
      event.source.textDivs.forEach((span) => {
        span.classList.add('box');
      });
    }
  }
}
