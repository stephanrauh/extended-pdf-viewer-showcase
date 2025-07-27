import { Component, ViewChild, Output, EventEmitter, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { NgxExtendedPdfViewerComponent, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CopyrightComponent } from '../common/copyright.component';
import { FullscreenButtonComponent } from '../../components/fullscreen-button/fullscreen-button.component';

@Component({
    selector: 'app-modal-dialog',
    
    standalone: true,
    templateUrl: './modal-dialog.component.html',
    imports: [
        CopyrightComponent,
        FullscreenButtonComponent,
        NgxExtendedPdfViewerModule,
    ]
})
export class ModalDialogComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  @ViewChild(NgxExtendedPdfViewerComponent, {static: false})
  private pdfViewer!: NgxExtendedPdfViewerComponent;

  @Output() closeDialog = new EventEmitter<void>();

  public onCloseClick(): void {
    console.log('Close dialog clicked');
    if (this.pdfViewer) {
      this.pdfViewer.ngOnDestroy();
    }
    this.closeDialog.emit();
  }
}
