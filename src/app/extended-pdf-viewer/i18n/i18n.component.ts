import { Component, OnInit, AfterContentInit } from '@angular/core';

@Component({
  selector: 'app-i18n',
  templateUrl: './i18n.component.html',
  styleUrls: ['./i18n.component.css']
})
export class I18nComponent {
  public hidePdfViewer = false;

  private _language = undefined;

  public get language(): string {
    return this._language;
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
    }, 1000);
  }
}
