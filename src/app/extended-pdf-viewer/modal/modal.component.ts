import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { MatCard } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.css'],
    imports: [
        MatCard,
        MatButton,
        MatTabGroup,
        MatTab,
        Ie11MarkdownComponent,
    ],
})
export class ModalComponent {
  private dialog = inject(MatDialog);


  public openDialog() {
    this.dialog.open(ModalDialogComponent, {
      width: '400px',
    });
  }
}
