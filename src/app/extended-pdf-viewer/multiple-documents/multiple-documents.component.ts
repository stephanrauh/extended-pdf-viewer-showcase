import { Component, NgZone, OnInit } from '@angular/core';
import { FileInputChanged, IPDFViewerApplication } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-multiple-documents',
  templateUrl: './multiple-documents.component.html',
  styleUrls: ['./multiple-documents.component.css']
})
export class MultipleDocumentsComponent implements OnInit {
  public src!: string;

  public dragAndDrop = true;

  public url = new URL(`${location.protocol}//${location.host}/assets/pdfs/GraalVM.pdf`);

  constructor(private ngZone: NgZone) {}

  public ngOnInit(): void {
    setTimeout(() => {
      const PDFViewerApplication: IPDFViewerApplication = (window as any).PDFViewerApplication;
      PDFViewerApplication.eventBus.on('fileinputchange', (event: FileInputChanged) => {
        this.ngZone.run(() => {
          if (event.dropEvent) {
            console.log("Drop Event: ", event.dropEvent);
          } else {
            console.log("The file has changed without using drag and drop", event.fileInput);
          }
        });
      });
    }, 2000);
  }
}
