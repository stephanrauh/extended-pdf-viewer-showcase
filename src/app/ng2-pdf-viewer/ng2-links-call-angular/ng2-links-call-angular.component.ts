import { Component } from '@angular/core';

@Component({
  selector: 'app-ng2-links-call-angular',
  templateUrl: './ng2-links-call-angular.component.html',
})
export class Ng2LinksCallAngularComponent {
  // tslint:disable-next-line: variable-name
  private _target: string = 'blank';

  public hidden = false;

  public counter = 0;

  public choice: string = 'default';

  public set target(t: string) {
    if (this._target !== t) {
      this._target = t;
      this.hidden = true;
      setTimeout(() => (this.hidden = false), 250);
    }
  }

  public get target(): string {
    return this._target;
  }

  public afterPageRendered(pageRenderedEvent: any) {
    const pageView = pageRenderedEvent.source; /* as PdfPageView */
    const div = pageView.div as HTMLDivElement;
    if (this.choice === 'inactive') {
      div.querySelectorAll('a').forEach((a: HTMLAnchorElement) => {
        a.href = 'javascript: void(0)';
        a.target = '';
      });
    } else if (this.choice === 'angular') {
      div.querySelectorAll('a').forEach((a: HTMLAnchorElement) => {
        a.onclick = () => setTimeout(() => this.count());
        a.target = '';
        a.href = 'javascript: void();';
      });
    }
  }

  public count(): void {
    this.counter++;
  }

  public manipulateLinks(choice: string): void {
    this.choice = choice;
    this.hidden = true;
    setTimeout(() => (this.hidden = false), 100);
  }
}
