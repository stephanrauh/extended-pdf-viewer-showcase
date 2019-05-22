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

  public highlighted = '';

  constructor() {}

  ngOnInit() {
    const c = this.code.split('\n').join('(newline)');
    this.highlighted = Prism.highlight(c, Prism.languages.html, 'html');
    this.highlighted = this.highlighted
      .split('(newline)</span>')
      .join('</span>(newline)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
      .split('(newline)')
      .join('<br />');
  }
}
