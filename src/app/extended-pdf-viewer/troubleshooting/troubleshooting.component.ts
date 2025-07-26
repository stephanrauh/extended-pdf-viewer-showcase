import { Component } from '@angular/core';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';

@Component({
    selector: 'app-troubleshooting',
    
    standalone: true,
    templateUrl: './troubleshooting.component.html',
    styleUrls: ['./troubleshooting.component.css'],
    imports: [Ie11MarkdownComponent]
})
export class TroubleshootingComponent {
}
