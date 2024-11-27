import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-i18n',
  templateUrl: './i18n.component.html',
  styleUrls: ['./i18n.component.css'],
})
export class I18nComponent {
  public hidePdfViewer = false;

  public _selectedTab = 0;

  private _language: string | undefined = 'nl-BE';

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public get selectedTab(): number {
    return this._selectedTab;
  }

  public set selectedTab(tab: number) {
    this._selectedTab = tab;
    this.hidePdfViewer = true;
    setTimeout(() => {
      this.hidePdfViewer = false;
    });
  }

  public get language(): string {
    return this._language || '';
  }

  public set language(language: string) {
    let writingDirectionChange = false;
    if (this._language === 'ar' && language !== 'ar') {
      writingDirectionChange = true;
    }
    if (this._language !== 'ar' && language === 'ar') {
      writingDirectionChange = true;
    }
    this._language = language;

    if (writingDirectionChange) {
      // brute force approach necessary because Angular's mat-drawer doesn't detect the change
      // between LTR and RTL languages
      const drawer = document.getElementsByClassName('mat-drawer-content')[0] as HTMLElement;
      const styleLeft = drawer.style.marginLeft;
      const styleRight = drawer.style.marginRight;
      drawer.style.marginLeft = styleRight;
      drawer.style.marginRight = styleLeft;
    }

    this.hidePdfViewer = true;
    setTimeout(() => {
      this.hidePdfViewer = false;
    });
  }
}
