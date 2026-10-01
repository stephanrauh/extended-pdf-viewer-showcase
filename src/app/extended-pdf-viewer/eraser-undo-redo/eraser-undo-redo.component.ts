import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { LanguagePipe } from 'ngx-markdown';
import { NgxExtendedPdfViewerModule, pdfDefaultOptions, ResponsiveVisibility } from 'ngx-extended-pdf-viewer';
import { ThemeService } from '../../services/theme.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';

@Component({
  selector: 'app-eraser-undo-redo',
  standalone: true,
  templateUrl: './eraser-undo-redo.component.html',
  styleUrls: ['./eraser-undo-redo.component.css'],
  imports: [FormsModule, AsyncPipe, LanguagePipe, Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective],
})
export class EraserUndoRedoComponent {
  private themeService = inject(ThemeService);
  public fullscreenService = inject(FullscreenService);

  public get theme(): string {
    return this.themeService.theme();
  }

  public showEraserEditor: ResponsiveVisibility = 'xxxl';
  public showUndoRedoButtons: ResponsiveVisibility = 'xxxl';

  public options: ResponsiveVisibility[] = [true, false, 'always-visible', 'always-in-secondary-menu', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'];

  /** The eraser and the undo/redo buttons only exist in the bleeding-edge bundle (pdf.js 6.3 and up). */
  public get isBleedingEdge(): boolean {
    return pdfDefaultOptions.assetsFolder?.includes('bleeding-edge');
  }

  public withExplanation(option: ResponsiveVisibility): string {
    if (option === true) {
      return 'true (uses the defaults)';
    } else if (option === false) {
      return 'false (hidden)';
    } else if (option === 'xxxl') {
      return "'xxxl' (the default)";
    }
    return `'${option}'`;
  }

  public get sourcecode(): string {
    return `<ngx-extended-pdf-viewer
  [src]="'/assets/pdfs/ngx-extended-pdf-viewer-flyer.pdf'"
  [showEraserEditor]="${this.literal(this.showEraserEditor)}"
  [showUndoRedoButtons]="${this.literal(this.showUndoRedoButtons)}">
</ngx-extended-pdf-viewer>`;
  }

  private literal(option: ResponsiveVisibility): string {
    return typeof option === 'boolean' ? String(option) : `'${option}'`;
  }
}
