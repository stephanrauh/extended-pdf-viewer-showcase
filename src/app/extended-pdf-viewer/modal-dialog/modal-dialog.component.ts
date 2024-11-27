import { Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxExtendedPdfViewerComponent } from 'ngx-extended-pdf-viewer';

@Component({
standalone: false,
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html'
})
export class ModalDialogComponent {
  @ViewChild(NgxExtendedPdfViewerComponent, {static: false})
  private pdfViewer!: NgxExtendedPdfViewerComponent;



  constructor(public dialogRef: MatDialogRef<ModalDialogComponent>) {
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
