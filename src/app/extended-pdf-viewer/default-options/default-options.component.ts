import { ChangeDetectorRef, Component, OnInit, ElementRef, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { compareFunction, convertMDToTable } from '../attributes/md-to-table-converter';
import { HttpClient } from '@angular/common/http';
import { Settings, Angular2SmartTableModule, LocalDataSource } from 'angular2-smart-table';
import { isBrowser } from '../common/utilities';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-default-options',
    
    standalone: true,
    templateUrl: './default-options.component.html',
    styleUrls: ['./default-options.component.css'],
    imports: [
        Ie11MarkdownComponent,
        Angular2SmartTableModule,
        DemoComponent,
        NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective,
        AsyncPipe,
    ],
})
export class DefaultOptionsComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
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

  public availableOptions = new LocalDataSource();

  public coveredOptions = new LocalDataSource();
  public defaultoptionscomponentTab: string = 'overview';
  public codeTab: string = 'htmltemplate';

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
    const [availableOptions, coveredOptions] = await Promise.all([
      convertMDToTable('/assets/extended-pdf-viewer/default-options/available-options.md', this.httpClient),
      convertMDToTable('/assets/extended-pdf-viewer/default-options/covered-options.md', this.httpClient),
    ]);
    await this.availableOptions.load(availableOptions);
    await this.coveredOptions.load(coveredOptions);
    // No Zone.js in this app — must trigger CD explicitly after async data load.
    this.cdr.detectChanges();
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
