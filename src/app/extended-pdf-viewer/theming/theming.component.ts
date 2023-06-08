import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { ChangeDetectionStrategy, Component, OnChanges, SimpleChanges } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { isLocalhost } from '../common/utilities';
@Component({
  selector: 'app-forms',
  templateUrl: './theming.component.html',
  styleUrls: ['./theming.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ThemingComponent {
  public _selectedTab = 1;

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public theme = 'light';
  public backgroundColor = 'lightgrey';
  public src = '/assets/pdfs/OoPdfFormExample.pdf';

  constructor(private ngxService: NgxExtendedPdfViewerService) {}

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.ngxService.recalculateSize());
  }

  public get selectedTab() {
    return this._selectedTab;
  }

  public set selectedTab(tab: number) {
    this._selectedTab = tab;
    if (tab === 1) {
      this.theme = 'light';
      this.backgroundColor = 'lightgrey';
      this.src = '/assets/pdfs/OoPdfFormExample.pdf';
    }
    if (tab === 2) {
      this.theme = 'dark';
      this.backgroundColor = 'black';
      this.src = '/assets/pdfs/OoPdfFormExample-dark.pdf';
    }
  }

  public onSelectTab(event: MatTabChangeEvent): void {
    this.selectedTab = event.index + 1;
  }
}
