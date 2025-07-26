import { Component, inject } from '@angular/core';
import { AnnotationLayerRenderedEvent, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-annotation-layer',

  standalone: true,
  templateUrl: './annotation-layer.component.html',
  styleUrls: ['./annotation-layer.component.css'],
  imports: [CommonModule, Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, AsyncPipe],
})
export class AnnotationLayerComponent {
  public fullscreenService = inject(FullscreenService);

  public activeTab: string = 'types';
  public codeTab: string = 'html';

  public onAnnotationLayerRendered(event: AnnotationLayerRenderedEvent): void {
    const copyrightHint = event.source.div.querySelector('.freeTextAnnotation');
    if (copyrightHint && copyrightHint instanceof HTMLElement) {
      copyrightHint.style.left = '20%';
      const canvas = copyrightHint.querySelector('canvas');
      if (canvas) {
        canvas.style.width = '75%';
        canvas.style.height = '75%';
        canvas.style.top = '20px';
        canvas.style.left = '10%';
      }
    }
  }

  public toggleEveryPopup(): void {
    document.querySelectorAll('.popupTriggerArea').forEach((popupTriggerArea) => {
      (popupTriggerArea as HTMLElement).click();
    });
  }
}
