import { Component, OnInit } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-find',
  templateUrl: './find.component.html',
  styleUrls: ['./find.component.css']
})
export class FindComponent implements OnInit {
  // tslint:disable-next-line:variable-name
  public _searchtext = '';

  public get searchtext(): string {
    return this._searchtext;
  }

  public set searchtext(text: string) {
    if (this.ngxExtendedPdfViewerService.find(text)) {
      this._searchtext = text;
    }
  }

  constructor(private ngxExtendedPdfViewerService: NgxExtendedPdfViewerService) {}

  ngOnInit() {}

  public findNext(): void {
    this.ngxExtendedPdfViewerService.findNext();
  }

  public findPrevious(): void {
    this.ngxExtendedPdfViewerService.findPrevious();
  }
}
