import { Component } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
  standalone: false,
  selector: 'app-modifying-page-order',
  templateUrl: './modifying-page-order.component.html',
  styleUrls: ['./modifying-page-order.component.css'],
})
export class ModifyingPageOrderComponent {

  constructor(public fullscreenService: FullscreenService) {
    pdfDefaultOptions.enablePageReordering = true;
  }
}
