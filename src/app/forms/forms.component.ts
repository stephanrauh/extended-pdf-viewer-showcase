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
  public country = 'Germany';
  public jobExperience = '6';
  public typeScript = true;

  public get formData(): { [fieldName: string]: string | number | boolean } {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      yearsOfExperience: this.jobExperience,
      typeScript: this.typeScript,
      country: this.country
    };
  }

  public set formData(data: { [fieldName: string]: string | number | boolean }) {
    this.firstName = data.firstName as string;
    this.lastName = data.lastName as string;
    this.jobExperience = data.yearsOfExperience as string;
    this.country = data.country as string;
    this.typeScript = data.typeScript === 'true';
  }

  constructor() {}

  public onSelectedTab(event: number): void {
    this.selectedTab = event;
  }
}
