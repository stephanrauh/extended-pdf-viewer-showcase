import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';

@Component({
        selector: 'app-getting-started',
    
    standalone: true,
    templateUrl: './getting-started.component.html',
    styleUrls: ['./getting-started.component.css'],
    imports: [CommonModule, Ie11MarkdownComponent]
})
export class GettingStartedComponent  {
  activeTab: string = 'recommended';
}
