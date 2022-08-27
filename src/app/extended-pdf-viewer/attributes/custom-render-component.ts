import { Component, Input, OnInit } from '@angular/core';

import { ViewCell } from 'angular2-smart-table';

@Component({
  templateUrl: 'custom-render-component.html'
})
export class CustomRenderComponent implements ViewCell, OnInit {
  public file!: string;
  @Input() rowData: any;
  public value!: string | number;

  public ngOnInit(): void {
    this.file = `/assets/extended-pdf-viewer/attributes/${this.rowData.defaultValue}`;
  }
}
