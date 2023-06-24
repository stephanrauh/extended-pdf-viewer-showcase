import { Component, ViewChild } from '@angular/core';
import { NgxExtendedPdfViewerComponent, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  public isLocalhost = isLocalhost();



  constructor(private dialog: MatDialog) {}

  public openDialog() {
    this.dialog.open(ModalDialogComponent, {
      width: '400px'
    });

  }
}
