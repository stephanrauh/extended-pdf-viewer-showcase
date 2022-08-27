import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { IColumnType, ISortDirection, Settings } from 'angular2-smart-table';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomRenderComponent } from './custom-render-component';

@Component({
  selector: 'app-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.css'],
})
export class AttributesComponent implements OnInit, AfterViewInit {
  public attributesAndEvents: Array<object> = [];
  public lowLevelApi: Array<object> = [];

  private compareFunction = (dir: number, a: string, b: string) => {
    a = a.replace('[', '').replace(']', '').replace('(', '').replace(')', '').replace('<s>', '').replace('</s>', '');
    b = b.replace('[', '').replace(']', '').replace('(', '').replace(')', '').replace('<s>', '').replace('</s>', '');
    if (dir === 1) {
      return a.localeCompare(b);
    }
    return b.localeCompare(a);
  };

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
        type: IColumnType.Html,
        sortDirection: 'asc' as ISortDirection,
        compareFunction: this.compareFunction,
      },
      description: {
        title: 'Description',
        type: IColumnType.Html,
      },
      defaultValue: {
        title: 'Default value',
        width: '100px',
        filter: false,
      },
    },
    pager: {
      display: false,
    },
  };

  public lowLevelApiTableSettings = {
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
        type: IColumnType.Html,
        sortDirection: 'asc' as ISortDirection,
        compareFunction: this.compareFunction,
      },
      description: {
        title: 'Description',
        type: IColumnType.Html,
      },
      sourcecode: {
        title: 'Source code',
        width: '100px',
        type: IColumnType.Custom,
        renderComponent: CustomRenderComponent,
        filter: false,
      },
    },
    pager: {
      display: false,
    },
  };

  constructor(private httpClient: HttpClient, private element: ElementRef) {}

  public async ngOnInit(): Promise<void> {
    this.attributesAndEvents = await this.convertMDToTable('/assets/extended-pdf-viewer/attributes/attributes.md');
    this.lowLevelApi = await this.convertMDToTable('/assets/extended-pdf-viewer/attributes/low-level-api.md');
  }

  private async convertMDToTable(file: string): Promise<Array<any>> {
    const source = await firstValueFrom(
      this.httpClient.get(file, {
        responseType: 'text',
      })
    );
    const lines = this.splitLines(this.removeHeader(source));
    return lines.map((line) => this.parseColumns(line));
  }

  public ngAfterViewInit(): void {
    let html = this.element.nativeElement as HTMLElement;
    let inputFields = html.querySelectorAll('input');
    inputFields.forEach((field) => {
      field.placeholder = '(type to filter)';
    });
  }

  private removeHeader(raw: string): string {
    const parts = raw.split('------------------- |');
    return parts[parts.length - 1];
  }

  private splitLines(raw: string): Array<string> {
    return raw.trim().split('\n');
  }

  private parseColumns(line: string): object {
    const columns = line.split('|');
    return {
      attribute: this.strikeThrough(columns[1].trim()),
      defaultValue: columns[2].trim(),
      description: this.findLinks(this.addCodeTags(columns[3].trim())),
    };
  }

  private addCodeTags(text: string): string {
    const fragments = text.split('`');
    let result = fragments[0];
    for (let i = 1; i < fragments.length; i++) {
      if (i % 2 === 1) {
        result += '<code>';
      } else {
        result += '</code>';
      }
      result += fragments[i];
    }
    return result;
  }

  private findLinks(text: string): string {
    const s1 = text.indexOf('[');
    const s2 = text.indexOf(']');
    const b1 = text.indexOf('(');
    const b2 = text.indexOf(')');
    if (s1 >= 0 && s2 > s1 && b1 === s2 + 1 && b2 > b1) {
      const link = text.substring(s1 + 1, s2);
      const caption = text.substring(b1 + 1, b2);
      text = text.substring(0, s1) + '<a target="#" href="' + link + '">' + caption + '</a>' + text.substring(b2 + 1);
      return this.findLinks(text);
    }
    return text;
  }

  private strikeThrough(text: string): string {
    if (text.startsWith('~~') && text.endsWith('~~')) {
      text = text.replace('~~', '');
      text = text.replace('~~', '');
      return '<s>' + text + '</s>';
    }
    return text;
  }
}
