import { Component } from '@angular/core';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.css']
})
export class SimpleComponent {

  public selectedTab = 0;

  public page = 5;

  public pageLabel: string;

  constructor() {
  }

  public onSelectedTab(event: number): void {
    this.selectedTab = event;
  }
}
