import { Component, inject } from '@angular/core';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',

  standalone: true,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  imports: [Ie11MarkdownComponent, ModalDialogComponent, CommonModule],
})
export class ModalComponent {
  public activeTab = 'typescript';
  public isModalOpen = false;

  public openDialog() {
    this.isModalOpen = true;
  }

  public closeDialog() {
    this.isModalOpen = false;
  }

  public onBackdropClick(event: Event) {
    // Close modal when clicking the backdrop (not the content)
    if (event.target === event.currentTarget) {
      this.closeDialog();
    }
  }
}
