import { Component, Input } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
        selector: 'app-ie11-markdown',
    
    standalone: true,
    templateUrl: './ie11-markdown.component.html',
    styleUrls: ['./ie11-markdown.component.css'],
    imports: [MarkdownComponent]
})
export class Ie11MarkdownComponent {

  @Input()
  public data: any;

  @Input()
  public src!: string;

  public isIE11 = typeof window === 'undefined' ? false : !!(globalThis as any).MSInputMethodContext && !!(document as any).documentMode;

}
