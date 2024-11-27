import { Component, Input, OnInit } from '@angular/core';

@Component({
standalone: false,
  selector: 'app-ie11-markdown',
  templateUrl: './ie11-markdown.component.html',
  styleUrls: ['./ie11-markdown.component.css']
})
export class Ie11MarkdownComponent implements OnInit {

  @Input()
  public data: any;

  @Input()
  public src!: string;

  public isIE11 = typeof window === 'undefined' ? false : !!(globalThis as any).MSInputMethodContext && !!(document as any).documentMode;


  constructor() { }

  ngOnInit(): void {
  }

}
