import { ChangeDetectorRef, Component, ElementRef, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { AnnotationLayerRenderedEvent, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe, CommonModule } from '@angular/common';

/** One of the layers pdf.js stacks on top of each other to render a page. */
export interface PdfLayerDescription {
  /** The CSS class pdf.js gives the layer's div - and the key this demo identifies it by. */
  cssClass: string;
  name: string;
  short: string;
  description: string;
  /** Does the page currently on screen contain this layer, and does it contain anything? */
  present: boolean;
  empty: boolean;
}

@Component({
  selector: 'app-annotation-layer',

  standalone: true,
  templateUrl: './annotation-layer.component.html',
  styleUrls: ['./annotation-layer.component.css'],
  imports: [CommonModule, Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective, AsyncPipe],
})
export class AnnotationLayerComponent {
  private themeService = inject(ThemeService);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  public get theme(): string {
    return this.themeService.theme();
  }
  public fullscreenService = inject(FullscreenService);

  public activeTab: string = 'stack';
  public codeTab: string = 'html';

  /** The layer the user singled out in the diagram, or null when every layer is shown. */
  public isolatedLayer: string | null = null;

  /**
   * Listed top to bottom, which is the reverse of the order pdf.js paints them in
   * (see LAYERS_ORDER in pdf_page_view.js): the canvas is at the bottom, the annotation
   * editor layer and the XFA layer share the topmost slot.
   */
  public layers: PdfLayerDescription[] = [
    {
      cssClass: 'annotationEditorLayer',
      name: 'Annotation editor layer',
      short: 'what your users add',
      description:
        'Holds the highlights, free text, drawings, stamps, and signatures your users create with the editor buttons in the toolbar. It stays empty until somebody uses one of the editors, or until you add an annotation via the API. These annotations become real PDF annotations only when the document is saved.',
      present: false,
      empty: true,
    },
    {
      cssClass: 'xfaLayer',
      name: 'XFA layer',
      short: 'the one that is easy to forget',
      description:
        "XFA is Adobe's XML-based form format. If a PDF file is a pure XFA form, pdf.js renders it as HTML into this layer instead of painting the page onto the canvas. Hardly any document uses it, so you rarely see it - and it shares the topmost slot with the annotation editor layer.",
      present: false,
      empty: true,
    },
    {
      cssClass: 'annotationLayer',
      name: 'Annotation layer',
      short: 'links, form fields, comments',
      description:
        'Everything interactive that is stored in the PDF file itself: links, form fields, comment popups, and file attachments. It consists of invisible HTML elements placed exactly over what the canvas has painted - which is why you can change how they behave (see the "Manipulating" tab) but not how they look.',
      present: false,
      empty: true,
    },
    {
      cssClass: 'textLayer',
      name: 'Text layer',
      short: 'invisible, selectable text',
      description:
        'A transparent copy of the page text, positioned character by character over the canvas. It is what makes text selectable and copyable, and it is what the find bar searches. Switch it off with [textLayer]="false" to render faster - at the price of losing search and text selection.',
      present: false,
      empty: true,
    },
    {
      cssClass: 'canvasWrapper',
      name: 'Canvas',
      short: 'the page you actually see',
      description:
        'The page itself, painted onto an HTML canvas. This is the only layer that is always there. When you zoom in, pdf.js adds a second "detail" canvas so the visible part of the page stays sharp without re-rendering the whole page. The wrapper also holds the invisible accessibility markup (the struct tree).',
      present: false,
      empty: true,
    },
  ];

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
    this.updateLayerStatus();
  }

  public onPageRendered(): void {
    this.updateLayerStatus();
  }

  /**
   * Looks at the page currently on screen and reports which layers pdf.js has really
   * created. Isolating a layer only shows something if that layer exists and isn't empty.
   */
  private updateLayerStatus(): void {
    setTimeout(() => {
      const page = this.elementRef.nativeElement.querySelector('.page') as HTMLElement | null;
      for (const layer of this.layers) {
        const div = page?.querySelector('.' + layer.cssClass);
        layer.present = !!div;
        layer.empty = !div || div.childElementCount === 0;
      }
      this.cdr.markForCheck();
    }, 300);
  }

  public toggleLayer(layer: PdfLayerDescription): void {
    this.isolatedLayer = this.isolatedLayer === layer.cssClass ? null : layer.cssClass;
  }

  public showEveryLayer(): void {
    this.isolatedLayer = null;
  }

  public get isolatedLayerDescription(): PdfLayerDescription | undefined {
    return this.layers.find((layer) => layer.cssClass === this.isolatedLayer);
  }

  public toggleEveryPopup(): void {
    document.querySelectorAll('.popupTriggerArea').forEach((popupTriggerArea) => {
      (popupTriggerArea as HTMLElement).click();
    });
  }
}
