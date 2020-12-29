import { Component, OnChanges } from '@angular/core';

@Component({
  selector: 'app-ng2-simple',
  templateUrl: './ng2-simple.component.html'
})
export class Ng2SimpleComponent {

  public page = 1;

  public renderText = true;

  public rotation = 0;

}
