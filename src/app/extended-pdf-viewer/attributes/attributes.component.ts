import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, AfterViewInit, OnInit, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';
import { Settings, Angular2SmartTableModule } from 'angular2-smart-table';
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
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  private httpClient = inject(HttpClient);
  private domElement = inject(ElementRef);

  public activeTab: string = 'attributes';
  public attributesAndEvents: object[] = [];
  public lowLevelApi: object[] = [];

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
        sortDirection: 'asc',
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
        sortDirection: 'asc',
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

  public async ngOnInit(): Promise<void> {
    this.attributesAndEvents = await convertMDToTable('/assets/extended-pdf-viewer/attributes/attributes.md', this.httpClient);
    this.lowLevelApi = await convertMDToTable('/assets/extended-pdf-viewer/attributes/low-level-api.md', this.httpClient);
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
