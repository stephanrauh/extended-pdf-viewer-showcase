````typescript
export class I18nComponent {
  public hidePdfViewer = false;

  private _language = 'es-ES';

  public get language(): string {
    return this._language;
  }

  public set language(language: string) {
    this._language = language;
    this.hidePdfViewer = true;
    setTimeout(() => {
      this.hidePdfViewer = false;
    }, 1000);
  }
  constructor() {}
}
````
