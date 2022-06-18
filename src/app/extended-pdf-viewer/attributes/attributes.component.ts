import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { IColumnType, ISortDirection } from 'angular2-smart-table';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.css'],
})
export class AttributesComponent implements AfterViewInit {
  public data: Array<object> = [];

  private compareFunction = (dir: number, a: string, b: string) => {
    a = a.replace("[", "").replace("]", "").replace("(", "").replace(")", "").replace("<s>", "").replace("</s>", "");
    b = b.replace("[", "").replace("]", "").replace("(", "").replace(")", "").replace("<s>", "").replace("</s>", "");
    if (dir === 1) {
      return a.localeCompare(b);
    }
    return b.localeCompare(a);
  }

  public settings = {
    actions: {
      edit: false,
      delete: false,
      add: false,
    },
    attr: {
      class: 'text'
    },
    columns: {
      attribute: {
        title: 'Attribute',
        type: IColumnType.Html,
        sortDirection: 'asc' as ISortDirection,
        compareFunction: this.compareFunction
      } ,
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

  constructor(private httpClient: HttpClient, private element: ElementRef) {
    this.httpClient
      .get('/assets/extended-pdf-viewer/attributes/attributes.md', {
        responseType: 'text',
      })
      .pipe(
        map((raw) => this.removeHeader(raw)),
        map((raw) => this.splitLines(raw)),
        map((lines) => lines.map((line) => this.parseColumns(line))),
      )
      .subscribe((data) => {
        this.data = data;

        });
  }

  ngAfterViewInit() {
    let html = this.element.nativeElement as HTMLElement;
        let inputFields = html.querySelectorAll("input");
        inputFields.forEach(field => {
          field.placeholder = "(type to filter)";
        })
  }

  private removeHeader(raw: string): string {
    return raw.split('------------------- |')[2];
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
    const fragments = text.split("`");
    let result = fragments[0]
    for (let i = 1; i < fragments.length; i++) {
      if (i % 2 === 1) {
        result += "<code>";
      } else {
        result += "</code>";
      }
      result += fragments[i];
    }
    return result;
  }

  private findLinks(text: string): string {
    const s1 = text.indexOf("[");
    const s2 = text.indexOf("]");
    const b1 = text.indexOf("(");
    const b2 = text.indexOf(")");
    if (s1 >= 0 && s2 > s1 && (b1 === s2 +1 ) && b2 > b1) {
      const link = text.substring(s1+1, s2);
      const caption = text.substring(b1+1, b2);
      text = text.substring(0, s1) + '<a target="#" href="' + link + '">' + caption + "</a>" + text.substring(b2+1);
      return this.findLinks(text);
    }
    return text;
  }

  private strikeThrough(text: string): string {
    if (text.startsWith("~~") && text.endsWith("~~")) {
      text = text.replace("~~", "");
      text = text.replace("~~", "");
      return "<s>" + text + "</s>";
    }
    return text;
  }
}
