import { Component } from '@angular/core';

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.css'],
})
export class LayersComponent {
  public selectedTab = 0;

  constructor() {}

  public onSelectedTab(event: number): void {
    this.selectedTab = event;
  }
}
