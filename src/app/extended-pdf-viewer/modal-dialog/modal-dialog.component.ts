import { Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxExtendedPdfViewerComponent } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html'
})
export class ModalDialogComponent {
  @ViewChild(NgxExtendedPdfViewerComponent, {static: false})
  private pdfViewer!: NgxExtendedPdfViewerComponent;

  public isLocalhost = isLocalhost();

  constructor(public dialogRef: MatDialogRef<ModalDialogComponent>) {
    dialogRef.beforeClosed().subscribe((result) => {
      console.log('The dialog is about to be closed');
      this.pdfViewer.ngOnDestroy();
    });
  }

  public onCloseClick(): void {
    this.dialogRef.close();
  }
}
