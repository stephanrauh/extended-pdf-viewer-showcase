import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { FullscreenService } from '../../services/fullscreen.service';
@Component({
standalone: false,
  selector: 'app-forms',
  templateUrl: './theming.component.html',
  styleUrls: ['./theming.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ThemingComponent {

  public fullscreenService = inject(FullscreenService);
  public _selectedTab = 1;

  public theme = 'light';
  public backgroundColor = 'lightgrey';
  public src = '/assets/pdfs/OoPdfFormExample.pdf';

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
