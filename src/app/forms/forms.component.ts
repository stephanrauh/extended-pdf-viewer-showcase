import { Component } from '@angular/core';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css'],
})
export class FormsComponent {
  public selectedTab = 0;

  public firstName = 'Jane';

  public lastName = 'Doe';

  public get formData(): { [fieldName: string]: string } {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
    };
  }

  public set formData(data: { [fieldName: string]: string }) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
  }

  constructor() {}

  public onSelectedTab(event: number): void {
    this.selectedTab = event;
  }
}
