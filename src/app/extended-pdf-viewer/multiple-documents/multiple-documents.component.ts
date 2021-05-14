import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-multiple-documents',
  templateUrl: './multiple-documents.component.html',
  styleUrls: ['./multiple-documents.component.css']
})
export class MultipleDocumentsComponent {
  public src!: string;

  public dragAndDrop = true;

  public url = new URL(location.protocol + '//' + location.host + '/assets/pdfs/GraalVM.pdf');
}
