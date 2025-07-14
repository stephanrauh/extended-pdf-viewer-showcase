import { Component, Input, inject } from '@angular/core';
import { CopyrightService } from './copyright.service';

@Component({
    selector: 'app-copyright',
    templateUrl: './copyright.component.html',
    styleUrls: ['./copyright.component.css']
})
export class CopyrightComponent {
  private copyrightService = inject(CopyrightService);

  @Input() src!: string;

  get copyrightHint(): string {
    const hint = this.copyrightService.getCopyrightHint(this.src);
    return hint || 'No copyright information available.';
  }
}