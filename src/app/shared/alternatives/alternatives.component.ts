import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { Ie11MarkdownComponent } from '../ie11-markdown/ie11-markdown.component';

@Component({
    selector: 'app-alternatives',
    templateUrl: './alternatives.component.html',
    styleUrls: ['./alternatives.component.css'],
    imports: [MatCard, Ie11MarkdownComponent]
})
export class AlternativesComponent {
}
