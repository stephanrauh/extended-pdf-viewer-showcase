import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.css']
})
export class SimpleComponent implements OnInit {
  public code = `<ngx-extended-pdf-viewer
  [src]="'assets/pdfs/BootsFaces_Deep_Dive_1.0.pdf'"
  backgroundColor="#ffffff"
  [delayFirstView]="1000"
  [height]="'90vh'"
  [useBrowserLocale]="true"
>
</ngx-extended-pdf-viewer>`;

  constructor() {}

  ngOnInit() {}
}
