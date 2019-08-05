import { Component, OnInit } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-responsive-design',
  templateUrl: './responsive-design.component.html',
  styleUrls: ['./responsive-design.component.css']
})
export class ResponsiveDesignComponent {
  public ignoreResponsiveCSS = false;
  public tooSmall = false;
  public tooWide = false;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe('(min-width: 1169px)').subscribe(result => {
      this.tooWide = result.matches;
    });
    this.breakpointObserver.observe('(max-width: 630px)').subscribe(result => {
      this.tooSmall = result.matches;
    });
  }
}
