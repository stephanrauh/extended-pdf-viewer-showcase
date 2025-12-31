import { ChangeDetectorRef, Component, ElementRef, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Settings, Angular2SmartTableModule } from 'angular2-smart-table';
import { convertMDToTable } from '../attributes/md-to-table-converter';
import { isBrowser } from '../common/utilities';

@Component({
  selector: 'app-ngx-pdf-viewer-service',

  standalone: true,
  templateUrl: './ngx-pdf-viewer-service.component.html',
  styleUrls: ['./ngx-pdf-viewer-service.component.css'],
  imports: [NgxExtendedPdfViewerModule, AsyncPipe, Angular2SmartTableModule],
})
export class NgxPdfViewerServiceComponent {
  private cdr = inject(ChangeDetectorRef);
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  public ngxpdfviewerservicecomponentTab: string = 'overview';
  public codeTab: string = 'htmltemplate';
  public fullscreenService = inject(FullscreenService);

  private httpClient = inject(HttpClient);
  private domElement = inject(ElementRef);

  public attributesAndEvents: object[] = [];

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
        title: 'Method',
        type: 'html',
      },
      description: {
        title: 'Description',
        filter: { type: 'text' },
      },
            defaultValue: {
        title: 'Category',
        type: 'html',
        width: '180px',
        sortDirection: 'asc',
      },

    },
    pager: {
      display: false,
      perPage: 5000,
    },
  };

  constructor() {
    pdfDefaultOptions.enablePageReordering = true;
  }

  public async ngOnInit(): Promise<void> {
    this.attributesAndEvents = await convertMDToTable('/assets/extended-pdf-viewer/ngx-pdf-viewer-service/methods-table.md', this.httpClient);
    this.cdr.markForCheck();
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
