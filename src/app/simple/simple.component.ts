import { Component } from '@angular/core';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.css'],
})
export class SimpleComponent {
  public selectedTab = 0;

  public page = 5;

  public pageLabel: string;

  public showPdfViewer = true;

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

  public onSelectedTab(event: number): void {
    this.selectedTab = event;
  }
}
