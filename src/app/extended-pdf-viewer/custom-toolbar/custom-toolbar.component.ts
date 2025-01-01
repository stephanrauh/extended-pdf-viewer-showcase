import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-custom-toolbar',
  templateUrl: './custom-toolbar.component.html',
  styleUrls: ['./custom-toolbar.component.css'],
})
export class CustomToolbarComponent {
  public _theme = 'additional';

  public showPdfViewer = true;

  public showFreeFloatingBar = true;

  public src = '/assets/pdfs/dachstein.pdf';

  public zoom = '100%';

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public set theme(theme: string) {
    if (this._theme !== theme) {
      this.showPdfViewer = false;
      this._theme = theme;
      this.src = theme === 'findbar' ? '/assets/pdfs/GraalVM Dictionary Bytecode, Interpreters, C1 Compiler, C2 Compiler, CPUs, and More.pdf' : '/assets/pdfs/dachstein.pdf';
      setTimeout(() => (this.showPdfViewer = true), 100);
    } else {
      this._theme = theme;
    }
  }

  public get theme(): string {
    return this._theme;
  }

  public onClick(){
    // important: this method is called from outside, hence this may be undefined!
    window.open('assets/pdfs/dachstein.pdf', '#');
  };
}
