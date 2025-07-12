import { Component, ChangeDetectionStrategy, OnInit, ElementRef } from '@angular/core';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { compareFunction, convertMDToTable } from '../attributes/md-to-table-converter';
import { HttpClient } from '@angular/common/http';
import { Settings } from 'angular2-smart-table';
import { isBrowser } from '../common/utilities';
import { FullscreenService } from '../../services/fullscreen.service';

@Component({
  standalone: false,
  selector: 'app-default-options',
  templateUrl: './default-options.component.html',
  styleUrls: ['./default-options.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultOptionsComponent implements OnInit {
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

  constructor(private httpClient: HttpClient, private domElement: ElementRef, public fullscreenService: FullscreenService) {
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
