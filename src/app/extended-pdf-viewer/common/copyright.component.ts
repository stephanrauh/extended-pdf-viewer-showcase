import { Component, Input } from '@angular/core';
import { CopyrightService } from './copyright.service';

@Component({
  standalone: false,
  selector: 'app-copyright',
  templateUrl: './copyright.component.html',
  styleUrls: ['./copyright.component.css']
})
export class CopyrightComponent {
  @Input() src!: string;

  constructor(private copyrightService: CopyrightService) {}

  get copyrightHint(): string {
    const hint = this.copyrightService.getCopyrightHint(this.src);
    return hint || 'No copyright information available.';
  }
}