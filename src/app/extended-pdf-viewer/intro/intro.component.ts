import { Component } from '@angular/core';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';

@Component({
    selector: 'app-intro',
    
    standalone: true,
    templateUrl: './intro.component.html',
    styleUrls: ['./intro.component.css'],
    imports: [
        Ie11MarkdownComponent,
    ],
})
export class IntroComponent {}
