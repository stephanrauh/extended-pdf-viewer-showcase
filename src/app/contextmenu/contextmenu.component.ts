import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-contextmenu',
  templateUrl: './contextmenu.component.html',
  styleUrls: ['./contextmenu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContextmenuComponent {
  public allowContextMenu = false;
}
