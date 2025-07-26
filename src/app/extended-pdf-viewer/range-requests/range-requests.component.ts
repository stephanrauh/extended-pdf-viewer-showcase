import { Component } from '@angular/core';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';

@Component({
    selector: 'app-range-requests',
    
    standalone: true,
    templateUrl: './range-requests.component.html',
    styleUrls: ['./range-requests.component.css'],
    imports: [
        Ie11MarkdownComponent,
    ],
})
export class RangeRequestsComponent {}
