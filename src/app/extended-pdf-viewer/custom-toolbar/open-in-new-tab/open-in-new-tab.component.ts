import { Component } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
    selector: 'app-open-in-new-tab',
    
    standalone: true,
    templateUrl: './open-in-new-tab.component.html',
    styleUrls: ['./open-in-new-tab.component.css'],
    imports: [NgxExtendedPdfViewerModule]
})
export class OpenInNewTabComponent {

  public hasBeenClicked = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onClick = () => {};

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this; // necessary because onClick is called from outside, hence this may be undefined
    this.onClick = () => {
      self.hasBeenClicked = true;
      window.open('assets/pdfs/dachstein.pdf', '#');
    };
   }
}
