import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';

@Component({
  standalone: false,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {
  constructor(private dialog: MatDialog) {}

  public openDialog() {
    this.dialog.open(ModalDialogComponent, {
      width: '400px',
    });
  }
}
