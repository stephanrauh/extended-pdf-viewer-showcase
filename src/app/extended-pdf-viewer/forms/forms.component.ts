import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { ChangeDetectionStrategy, Component, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class FormsComponent implements OnChanges {
  public selectedTab = 0;

  public firstName = 'Lucí­a';

  public lastName = 'Garzas';
  public country = 'Spain';
  public jobExperience = '6';
  public typeScript = 'Yes';
  public databases = ['oracle','db2'];
  public educationLevel = 'bachelorDegree';
  public otherJobExperience = 'Several\nOther\nJobs';

  public downloaded: string | undefined;

  public rawFormData!: any[];

  public formData: { [fieldName: string]: string | string[] | number | boolean } = {};

  public updateFormData(): void {
    this.formData = {
      firstName: this.firstName,
      lastName: this.lastName,
      yearsOfExperience: this.jobExperience,
      typeScript: this.typeScript,
      country: this.country,
      databases: this.databases,
      educationLevel: this.educationLevel,
      otherJobExperience: this.otherJobExperience,
    };
  }

  public setFormData(data: { [fieldName: string]: string | string[] | number | boolean } | any) {
    this.firstName = data.firstName as string;
    this.lastName = data.lastName as string;
    this.jobExperience = data.yearsOfExperience as string;
    this.country = data.country as string;
    this.databases = data.databases as string[],
    this.educationLevel = data.educationLevel as string,
    this.otherJobExperience = data.otherJobExperience as string
    this.typeScript = data.typeScript as string;
  }

  constructor(private ngxService: NgxExtendedPdfViewerService) {
    this.updateFormData();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    debugger;
  }

  public async downloadAsBlob(): Promise<void> {
    this.downloaded = undefined;
    const blob = await this.ngxService.getCurrentDocumentAsBlob();
    if (blob) {
      this.downloaded = 'The BLOB contains ' + blob.size + ' byte.';
    } else {
      this.downloaded = 'download failed';
    }
  }

  public async readRawFormDescription(): Promise<void> {
    const raw = await this.ngxService.getFormData();
    this.rawFormData = raw.map((annotation: any) => ({
        alternativeText: annotation.fieldAnnotation.alternativeText,
        fieldName: annotation.fieldAnnotation.fieldName,
        fieldType: annotation.fieldAnnotation.fieldType,
        fieldValue: annotation.fieldAnnotation.fieldValue,
        id: annotation.fieldAnnotation.id,
        maxLen: annotation.fieldAnnotation.maxLen,
        rect: annotation.fieldAnnotation.rect
      }));
  }

}
