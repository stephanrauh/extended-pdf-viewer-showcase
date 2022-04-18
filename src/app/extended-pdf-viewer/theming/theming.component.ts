import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { ChangeDetectionStrategy, Component, OnChanges, SimpleChanges } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
@Component({
  selector: 'app-forms',
  templateUrl: './theming.component.html',
  styleUrls: ['./theming.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ThemingComponent {
  public _selectedTab = 1;

  private _fullscreen = false;

  public theme = 'light';
  public formTheme = 'light';
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
      this.formTheme = 'light';
      this.backgroundColor = 'lightgrey';
      this.src = '/assets/pdfs/OoPdfFormExample.pdf';
    }
    if (tab === 2) {
      this.theme = 'light';
      this.formTheme = 'dark';
      this.backgroundColor = 'lightgrey';
      this.src = '/assets/pdfs/OoPdfFormExample.pdf';
    }
    if (tab === 4) {
      this.theme = 'dark';
      this.formTheme = 'light';
      this.backgroundColor = 'black';
      this.src = '/assets/pdfs/OoPdfFormExample-dark.pdf';
    }
    if (tab === 5) {
      this.theme = 'dark';
      this.formTheme = 'dark';
      this.backgroundColor = 'black';
      this.src = '/assets/pdfs/OoPdfFormExample-dark.pdf';
    }
  }

  public onSelectTab(event: MatTabChangeEvent): void {
    if (event.index === 1) {
      this.selectedTab = 2;
    } else if (event.index === 2) {
      this.selectedTab = 4;
    } else if (event.index === 3) {
      this.selectedTab = 5;
    }
  }
}
