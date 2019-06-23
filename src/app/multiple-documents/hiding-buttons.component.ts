import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'hiding-buttons',
  templateUrl: './hiding-buttons.component.html',
  styleUrls: ['./hiding-buttons.component.css']
})
export class HidingButtonsComponent {
  public src = undefined;

  public updateFile(file: HTMLInputElement): void {
    this.src = file.value;
  }
}
