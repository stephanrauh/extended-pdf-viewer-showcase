import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-open-in-new-tab',
  templateUrl: './open-in-new-tab.component.html',
  styleUrls: ['./open-in-new-tab.component.css']
})
export class OpenInNewTabComponent {

  public hasBeenClicked = false;

  public onClick = () => {};

  constructor() {
    const self = this;
    this.onClick = () => {
      self.hasBeenClicked = true;
      window.open('assets/pdfs/dachstein.pdf', '#');
    };
   }
}
