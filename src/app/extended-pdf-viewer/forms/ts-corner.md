```typescript
export class FormsComponent {

  public jobExperience = '6';

  private initialized = false;

  public formData: {
    [fieldName: string]: string | string[] | number | boolean;
  } = {};

  public delayedUpdateFormData(): void {
    setTimeout(() => {
      this.initialized = true;
      this.updateFormData();
    });
  }

  public updateFormData(): void {
    this.formData = {
      ...
      yearsOfExperience: this.jobExperience,
      ...
    };
  }

  public setFormData(data: { [fieldName: string]: string | string[] | number | boolean } | any) {
    if (this.initialized) {
      ...
      this.jobExperience = data.yearsOfExperience as string;
      ...
    }
  }
}
```
