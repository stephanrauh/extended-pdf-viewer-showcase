import { Component, OnInit } from '@angular/core';
import { defaultOptions } from 'ngx-extended-pdf-viewer';
import { LinkTarget } from 'ngx-extended-pdf-viewer';
@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.css']
})
export class LinksComponent implements OnInit {

  constructor() {}

  ngOnInit() {
    defaultOptions.externalLinkTarget = LinkTarget.BLANK;
  }

  public get sourcecode(): string {
    return `import { defaultOptions } from 'ngx-extended-pdf-viewer/default-options';
    import { LinkTarget } from 'ngx-extended-pdf-viewer';
    ...
    ngOnInit(): void {
      defaultOptions.externalLinkTarget = LinkTarget.BLANK;
    }`;
  }
}
