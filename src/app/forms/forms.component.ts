import { Component } from '@angular/core';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css'],
})
export class FormsComponent {
  public selectedTab = 0;

  constructor() {}

  public onSelectedTab(event: number): void {
    this.selectedTab = event;
  }
}
