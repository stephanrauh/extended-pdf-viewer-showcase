import { Component } from '@angular/core';

@Component({
  selector: 'app-ng2-show-all',
  templateUrl: './ng2-show-all.component.html',
  styleUrls: ['./ng2-show-all.component.css']
})
export class Ng2ShowAllComponent {

  public showAll = true;

  public stickToPage = false;

  public page = 1;

  public scrollbar = true;
}
