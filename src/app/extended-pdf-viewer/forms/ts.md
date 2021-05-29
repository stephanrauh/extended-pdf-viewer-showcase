```typescript
export class FormsComponent {
  public firstName = 'Jane';

  public lastName = 'Doe';
  public country = 'Spain';
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
    this.typeScript = data.typeScript === 'true' || data.typeScript === true;
  }
}
```
