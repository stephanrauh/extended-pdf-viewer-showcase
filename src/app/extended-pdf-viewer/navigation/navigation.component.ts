import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css'],
    imports: [
        MatCard,
        MatButton,
        MatTabGroup,
        MatTab,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
    ],
})
export class NavigationComponent {
  public _namedDest: string | undefined;

  public page: number | undefined;

  public fullscreen = false;

  public get namedDest() {
    return this._namedDest;
  }

  public set namedDest(dest: string | undefined) {
    // reset the attribute to force change detection:
    this._namedDest = undefined;
    setTimeout(() => (this._namedDest = dest));
  }
}
