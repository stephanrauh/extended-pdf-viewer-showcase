import { Component, OnInit, Input } from '@angular/core';
import Prism from 'prismjs';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.css']
})
export class CodeComponent implements OnInit {
  @Input()
  public code = '';

  @Input()
  public language = 'html';

  public highlighted = '';

  constructor() {}

  ngOnInit() {
    const c = this.code.split('\n').join('newline');
    if (this.language === 'html') {
      this.highlighted = Prism.highlight(c, Prism.languages.html, 'html');
    } else {
      this.highlighted = Prism.highlight(c, Prism.languages.javascript, 'javascript');
    }
    this.highlighted = this.highlighted
      .split('newline</span>')
      .join('</span>newline&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
      .split('newline')
      .join('<br />');

    if (this.language === 'typescript') {
      const h = this.highlighted.split('<br />');
      let result: Array<string> = [];
      let indent = 0;
      for (let line of h) {
        if (line.includes('{')) {
          indent++;
        }
        for (let k = 0; k < indent; k++) {
          line = '&nbsp;&nbsp;&nbsp;&nbsp;' + line;
        }
        result.push(line);
        if (line.includes('}')) {
          indent--;
        }
      }
      this.highlighted = result.join('<br />');
    }
  }
}
