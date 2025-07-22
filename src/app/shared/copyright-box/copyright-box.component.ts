import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-copyright-box',
    
    standalone: true,
    templateUrl: './copyright-box.component.html',
    styleUrls: ['./copyright-box.component.css'],
})
export class CopyrightBoxComponent {
  @Input()
  public author!: string;

  @Input()
  public sourceShort!: string;

  @Input()
  public source!: string;

  @Input()
  public licenceLink!: string;

  @Input()
  public licence!: string;
}
