import { Component } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe('(max-width: 810px)').pipe(map(result => result.matches));

  constructor(private breakpointObserver: BreakpointObserver) {}
}
