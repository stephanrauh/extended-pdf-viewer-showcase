import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { Component } from '@angular/core';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css'],
})
export class FormsComponent {
  public selectedTab = 0;

  public firstName = 'Lucía';

  public lastName = 'Garzas';
  public country = 'Spain';
  public jobExperience = '6';
  public typeScript = true;

  public downloaded: string | undefined;

  public rawFormData: any[];

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

  constructor(private ngxService: NgxExtendedPdfViewerService) {}

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
