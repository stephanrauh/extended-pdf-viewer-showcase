import { Component, ChangeDetectionStrategy, OnInit, ElementRef, inject } from '@angular/core';
import { pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { compareFunction, convertMDToTable } from '../attributes/md-to-table-converter';
import { HttpClient } from '@angular/common/http';
import { Settings, Angular2SmartTableModule } from 'angular2-smart-table';
import { isBrowser } from '../common/utilities';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-default-options',
    
    standalone: true,
    templateUrl: './default-options.component.html',
    styleUrls: ['./default-options.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatCard,
        MatTabGroup,
        MatTab,
        Ie11MarkdownComponent,
        Angular2SmartTableModule,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class DefaultOptionsComponent implements OnInit {
  private httpClient = inject(HttpClient);
  private domElement = inject(ElementRef);
  fullscreenService = inject(FullscreenService);

  public tableSettings: Settings = {
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
    },
    pager: {
      display: false,
      perPage: 5000,
    },
  };

  public availableOptions: object[] = [];

  public coveredOptions: object[] = [];

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor() {
    pdfDefaultOptions.assetsFolder = 'bleeding-edge';
  }

  public async ngOnInit(): Promise<void> {
    this.availableOptions = await convertMDToTable('/assets/extended-pdf-viewer/default-options/available-options.md', this.httpClient);
    this.coveredOptions = await convertMDToTable('/assets/extended-pdf-viewer/default-options/covered-options.md', this.httpClient);
  }

  public addPlaceHolders(): void {
    if (isBrowser()) {
      const html = this.domElement.nativeElement as HTMLElement;
      const inputFields = html.querySelectorAll<HTMLInputElement>('angular2-smart-table-filter input');
      inputFields.forEach((field) => {
        field.placeholder = '(type to filter)';
      });
    }
  }
}
