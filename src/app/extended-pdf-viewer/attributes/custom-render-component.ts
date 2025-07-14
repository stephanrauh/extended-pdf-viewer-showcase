import { Component, Input, OnInit } from '@angular/core';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';

@Component({
    templateUrl: 'custom-render-component.html',
    imports: [Ie11MarkdownComponent]
})
export class CustomRenderComponent implements OnInit {
  public file!: string;
  @Input() rowData: any;
  public value!: string | number;

  public ngOnInit(): void {
    this.file = `/assets/extended-pdf-viewer/attributes/${this.rowData.defaultValue}`;
  }
}
