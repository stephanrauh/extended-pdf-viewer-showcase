import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { countries } from './countries';
import { ChangeDetectionStrategy, Component, OnChanges, SimpleChanges } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { isLocalhost } from '../common/utilities';
import { MatCheckboxChange } from '@angular/material/checkbox';
@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class FormsComponent {
  public selectedTab = 0;
  public theme = 'light';
  public xfa = false;
  public disableForms = false;

  public firstName = 'Lucía';

  public visible = true;

  // Acroform fields:
  public lastName = 'Garzas';
  public country = 'Spain';
  public jobExperience = '6';
  // two checkboxes that use the "export value" defined in the PDF:
  public typeScript = "Yes";
  public javaScript = "No";
  // two checkboxes that use boolean values instead of the "export value" defined in the PDF:
  public java = true;
  public cSharp = true;
  public databases = ['oracle', 'db2', 'sqlServer'];
  public educationLevel = 'bachelorDegree';
  public otherJobExperience = 'Several\nOther\nJobs';
  public countries = countries;

  // XFA fields:
  public serviceIn = '01';
  public familyName = 'Du Bois';
  public givenName = 'Michelle';
  public aliasNameIndicator = 'Y';
  public canadaUS = '1';
  public other = '1';
  public dateOfBirthYear = 1970;

  public downloaded: string | undefined;

  public rawFormData!: any[];

  private _fullscreen = false;

  public src = '/assets/pdfs/OoPdfFormExample.pdf';

  public formData: {
    [fieldName: string]: string | string[] | number | boolean;
  } = {};

  public xfaFormData: {
    [fieldName: string]: string | string[] | number | boolean;
  } = {};

  public isLocalhost = isLocalhost();
  public leftTab = 0;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.ngxService.recalculateSize());
  }

  public updateFormData(): void {
    if (this.xfa) {
      this.xfaFormData = {
        ...this.xfaFormData,
        // XFA form fields:
        ServiceIn: this.serviceIn,
        FamilyName: this.familyName,
        GivenName: this.givenName,
        AliasNameIndicator: this.aliasNameIndicator,
        CanadaUS: this.canadaUS,
        Other: this.other,
        DOBYear: this.dateOfBirthYear,
      };
    } else {
      this.formData = {
        ...this.formData,

        // Acroform fields:
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

        // XFA form fields:
        FamilyName: this.familyName,
        GivenName: this.givenName,
        AliasNameIndicator: this.aliasNameIndicator,
        CanadaUS: this.canadaUS,
        Other: this.other,
      };
    }
  }

  public setFormData(data: { [fieldName: string]: string | string[] | number | boolean } | any) {
    if (this.xfa) {
      this.formData = data;
      this.serviceIn = data['ServiceIn'];
      this.familyName = data['FamilyName'];
      this.givenName = data['GivenName'];
      this.aliasNameIndicator = data['AliasNameIndicator'];
      this.canadaUS = data['CanadaUS'];
      this.other = data['Other'];
      this.dateOfBirthYear = data['DOBYear'];
    } else {
      this.firstName = data.firstName as string;
      this.lastName = data.lastName as string;
      this.jobExperience = data.yearsOfExperience as string;
      this.country = data.country as string;
      this.databases = data.databases as string[];
      this.educationLevel = data.educationLevel as string;
      this.otherJobExperience = data.otherJobExperience as string;
      this.typeScript = data.typeScript;
      this.javaScript = data.javaScript;
      this.java = Boolean(data.java);
      this.cSharp = Boolean(data.cSharp);
      this.updateFormData();
    }
  }

  constructor(private ngxService: NgxExtendedPdfViewerService) {
    this.onSelectTab({ index: 0 } as MatTabChangeEvent);
    this.updateFormData();
  }

  public setCanadaUs(event: MatCheckboxChange): void {
    this.canadaUS = event.checked ? '1' : '0';
    this.updateFormData();
  }

  public delayedUpdateFormData(): void {
    setTimeout(() => {
      this.updateFormData();
    });
  }

  public async downloadAsBlob(): Promise<void> {
    this.downloaded = undefined;
    const blob = await this.ngxService.getCurrentDocumentAsBlob();
    if (blob) {
      this.downloaded =
        'The BLOB contains ' +
        blob.size +
        ' byte. If your browser supports that, the PDF file opens in a new tab or window, using the native PDF viewer of your browser.';
      const url = URL.createObjectURL(blob);
      globalThis.open(url, '_blank');
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
    this.leftTab = event.index;
    if (event.index === 2) {
      this.selectedTab = 2;
      setTimeout(() => {
        this.src = '/assets/pdfs/OoPdfFormExample.pdf';
        this.visible = true;
      });
    } else if (event.index === 3) {
      this.selectedTab = 4;
      setTimeout(() => {
        this.src = '/assets/pdfs/OoPdfFormExample.pdf';
        this.visible = true;
      });
    } else if (event.index === 4) {
      this.selectedTab = 5;
      setTimeout(() => {
        this.src = '/assets/pdfs/OoPdfFormExample.pdf';
        this.visible = true;
      });
    } else if (event.index === 5) {
      this.formData = {};
      this.visible = false;
      setTimeout(() => {
        this.src = '/assets/pdfs/under-copyright/XFA-Canada-Immigration.pdf';
        this.visible = true;
      });
      this.xfa = true;
      this.updateFormData();
    }
  }
}
