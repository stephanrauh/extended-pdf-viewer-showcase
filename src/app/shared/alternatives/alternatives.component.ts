import { Component } from '@angular/core';
import { Ie11MarkdownComponent } from '../ie11-markdown/ie11-markdown.component';

@Component({
    selector: 'app-alternatives',

    standalone: true,
    templateUrl: './alternatives.component.html',
    styleUrls: ['./alternatives.component.css'],
    imports: [Ie11MarkdownComponent]
})
export class AlternativesComponent {
}
