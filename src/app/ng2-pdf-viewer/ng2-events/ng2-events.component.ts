import { Component } from '@angular/core';

@Component({
  selector: 'app-ng2-events',
  templateUrl: './ng2-events.component.html',
  styleUrls: ['./ng2-events.component.css']
})
export class Ng2EventsComponent {

  public events: Array<string> = [];

  public onError(event: any): void {
    console.log(event);
  }

  public onEvent(type: string, event: any): void {
    if (Number(event)) {
      this.events.push(type + " " + event);
    } else if (type === 'on-progress') {
      this.events.push(type + " " + JSON.stringify(event));
    } else if (type === 'page-rendered' || type === "text-layer-rendered") {
      this.events.push(type + " " + event.pageNumber);
    } else {
      this.events.push(type);
    }
    console.info(type);
    console.debug(event);
  }
}
