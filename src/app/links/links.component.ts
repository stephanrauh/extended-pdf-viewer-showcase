import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.css']
})
export class LinksComponent implements OnInit {

  constructor() {}

  ngOnInit() {}

  public get sourcecode(): string {
    return `import { defaultOptions } from 'ngx-extended-pdf-viewer/default-options';
    import { LinkTarget } from '/ngx-extended-pdf-viewer/link-target';
    ...
    ngOnInit(): void {
      defaultOptions.externalLinkTarget = LinkTarget.BLANK;
    }`;
  }
}
