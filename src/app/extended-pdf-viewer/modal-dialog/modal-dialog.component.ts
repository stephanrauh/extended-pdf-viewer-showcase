import { Component, ViewChild, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxExtendedPdfViewerComponent, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CopyrightComponent } from '../common/copyright.component';
import { FullscreenButtonComponent } from '../../components/fullscreen-button/fullscreen-button.component';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-modal-dialog',
    templateUrl: './modal-dialog.component.html',
    imports: [CopyrightComponent, FullscreenButtonComponent, MatButton, NgxExtendedPdfViewerModule]
})
export class ModalDialogComponent {
  dialogRef = inject<MatDialogRef<ModalDialogComponent>>(MatDialogRef);

  @ViewChild(NgxExtendedPdfViewerComponent, {static: false})
  private pdfViewer!: NgxExtendedPdfViewerComponent;



  constructor() {
    const dialogRef = this.dialogRef;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dialogRef.beforeClosed().subscribe((result) => {
      console.log('The dialog is about to be closed');
      this.pdfViewer.ngOnDestroy();
    });
  }

  public onCloseClick(): void {
    this.dialogRef.close();
  }
}
