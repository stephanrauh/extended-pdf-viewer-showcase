import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, AfterViewInit, OnInit, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';
import { Settings, Angular2SmartTableModule, LocalDataSource } from 'angular2-smart-table';
import { isBrowser } from '../common/utilities';
import { compareFunction, convertMDToTable } from './md-to-table-converter';

@Component({
    selector: 'app-attributes',

    standalone: true,
    templateUrl: './attributes.component.html',
    styleUrls: ['./attributes.component.css'],
    imports: [
        CommonModule,
        Angular2SmartTableModule,
    ],
})
export class AttributesComponent implements OnInit, AfterViewInit {
  private cdr = inject(ChangeDetectorRef);
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  private httpClient = inject(HttpClient);
  private domElement = inject(ElementRef);

  public activeTab: string = 'attributes';
  public attributesSource = new LocalDataSource();
  public lowLevelApiSource = new LocalDataSource();

  public attributeTableSettings: Settings = {
    actions: {
      edit: false,
      delete: false,
      add: false,
    },
    attr: {
      class: 'text',
    },
    columns: {
      attribute: {
        title: 'Attribute',
        type: 'html',
        compareFunction,
      },
      description: {
        title: 'Description',
        type: 'html',
      },
      defaultValue: {
        title: 'Default value',
        width: '100px',
        filter: { type: 'text' },
      },
    },
    pager: {
      display: false,
      perPage: 5000,
    },
  };

  public lowLevelApiTableSettings: Settings = {
    actions: {
      edit: false,
      delete: false,
      add: false,
    },
    attr: {
      class: 'text',
    },
    columns: {
      attribute: {
        title: 'Attribute',
        compareFunction,
      },
      description: {
        title: 'Description',
      },
      sourcecode: {
        title: 'Source code',
        width: '100px',
        type: 'html',
      },
    },
    pager: {
      display: false,
    },
  };

  public ngOnInit(): void {
    if (isBrowser()) {
      this.loadData();
    }
  }

  private async loadData(): Promise<void> {
    const [attributesAndEvents, lowLevelApi] = await Promise.all([
      convertMDToTable('/assets/extended-pdf-viewer/attributes/attributes.md', this.httpClient),
      convertMDToTable('/assets/extended-pdf-viewer/attributes/low-level-api.md', this.httpClient),
    ]);
    await this.attributesSource.load(attributesAndEvents.sort((a: any, b: any) => compareFunction(1, a.attribute, b.attribute)));
    await this.lowLevelApiSource.load(lowLevelApi.sort((a: any, b: any) => compareFunction(1, a.attribute, b.attribute)));
    // No Zone.js in this app — must trigger CD explicitly after async data load.
    this.cdr.detectChanges();
  }

  public ngAfterViewInit(): void {
    if (isBrowser()) {
      const html = this.domElement.nativeElement as HTMLElement;
      const inputFields = html.querySelectorAll('input');
      inputFields.forEach((field) => {
        field.placeholder = '(type to filter)';
      });
    }
  }
}
