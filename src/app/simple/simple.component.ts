import { Component } from '@angular/core';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.css'],
})
export class SimpleComponent {
  // tslint:disable-next-line: variable-name
  public _selectedTab = 0;

  public page = 5;

  public pageLabel: string;

  public showPdfViewer = true;

  public set selectedTab(index: number) {
    localStorage.setItem('ngx-extended-pdf-viewer.simple.selectedTab', String(index));
  }

  public get selectedTab(): number {
    return Number(localStorage.getItem('ngx-extended-pdf-viewer.simple.selectedTab')) || 0;
  }

  public set theme(theme: string) {
    if (theme !== this.theme) {
      localStorage.setItem('ngx-extended-pdf-viewer.theme', theme);
      location = location;
    }
  }

  public get theme(): string {
    return localStorage.getItem('ngx-extended-pdf-viewer.theme') || 'light';
  }

  constructor() {}

}
