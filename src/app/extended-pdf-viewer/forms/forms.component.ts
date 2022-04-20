import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { countries } from './countries';
import { ChangeDetectionStrategy, Component, OnChanges, SimpleChanges } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class FormsComponent {
  public selectedTab = 0;

  public firstName = 'Lucía';

  public lastName = 'Garzas';
  public country = 'Spain';
  public jobExperience = '6';
  public typeScript = true;
  public javaScript = true;
  public java = true;
  public cSharp = true;
  public databases = ['oracle', 'db2', 'sqlServer'];
  public educationLevel = 'bachelorDegree';
  public otherJobExperience = 'Several\nOther\nJobs';
  public countries = countries;

  public downloaded: string | undefined;

  public rawFormData!: any[];

  private _fullscreen = false;

  private initialized = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.ngxService.recalculateSize());
  }

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
      firstName: this.firstName,
      lastName: this.lastName,
      yearsOfExperience: this.jobExperience,
      typeScript: this.typeScript,
      javaScript: this.javaScript,
      java: this.java,
      cSharp: this.cSharp,
      country: this.country,
      databases: this.databases,
      educationLevel: this.educationLevel,
      otherJobExperience: this.otherJobExperience,
    };
  }

  public setFormData(data: { [fieldName: string]: string | string[] | number | boolean } | any) {
    if (this.initialized) {
      this.firstName = data.firstName as string;
      this.lastName = data.lastName as string;
      this.jobExperience = data.yearsOfExperience as string;
      this.country = data.country as string;
      (this.databases = data.databases as string[]),
        (this.educationLevel = data.educationLevel as string),
        (this.otherJobExperience = data.otherJobExperience as string);
      this.typeScript = Boolean(data.typeScript);
      this.javaScript = Boolean(data.javaScript);
      this.java = Boolean(data.java);
      this.cSharp = Boolean(data.cSharp);
    }
  }

  constructor(private ngxService: NgxExtendedPdfViewerService) {}

  public async downloadAsBlob(): Promise<void> {
    this.downloaded = undefined;
    const blob = await this.ngxService.getCurrentDocumentAsBlob();
    if (blob) {
      this.downloaded =
        'The BLOB contains ' +
        blob.size +
        ' byte. If your browser support that, the PDF file opens in a new tab or window, using the native PDF viewer of your browser.';
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      this.downloaded = 'download failed';
    }
  }

  public async readRawFormDescription(): Promise<void> {
    const raw = await this.ngxService.getFormData();
    this.rawFormData = raw.map((annotation: any) => ({
      alternativeText: annotation.fieldAnnotation.alternativeText,
      fieldName: annotation.fieldAnnotation.fieldName,
      value: annotation.fieldAnnotation.value,
      fieldType: annotation.fieldAnnotation.fieldType,
      fieldValue: annotation.fieldAnnotation.fieldValue,
      pageNumber: annotation.pageNumber,
      id: annotation.fieldAnnotation.id,
      maxLen: annotation.fieldAnnotation.maxLen,
      rect: annotation.fieldAnnotation.rect,
    }));
  }

  public onSelectTab(event: MatTabChangeEvent): void {
    if (event.index === 1) {
      this.selectedTab = 2;
    } else if (event.index === 2) {
      this.selectedTab = 4;
    } else if (event.index === 3) {
      this.selectedTab = 5;
    }
  }
}
