import { Component, OnInit } from '@angular/core';
import { pdfDefaultOptions, LinkTarget } from 'ngx-extended-pdf-viewer';
@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.css'],
})
export class LinksComponent implements OnInit {
  public LinkTarget = LinkTarget;

  public hidden = false;

  private _target;;

  constructor() {}

  public set target(t: number) {
    if (this._target !== t) {
      this._target = t;
      this.hidden = true;
      pdfDefaultOptions.externalLinkTarget = t;
      setTimeout(() => (this.hidden = false), 250);
    }
  }

  public get target(): number {
    return this._target;
  }

  public ngOnInit() {
    this.target = LinkTarget.BLANK;

  }

  public get sourcecode(): string {
    let target: string;
    switch (this._target) {
      case LinkTarget.BLANK:
        target = 'BLANK';
        break;
      case LinkTarget.NONE:
        target = 'NONE';
        break;
      case LinkTarget.PARENT:
        target = 'PARENT';
        break;
      case LinkTarget.SELF:
        target = 'SELF';
        break;
      case LinkTarget.TOP:
        target = 'TOP';
        break;
    }

    return `import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer/default-options';
import { LinkTarget } from 'ngx-extended-pdf-viewer';
...
ngOnInit(): void {
  pdfDefaultOptions.externalLinkTarget = LinkTarget.${target};
}`;
  }
}
