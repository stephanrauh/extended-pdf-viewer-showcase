import { Component } from '@angular/core';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';

@Component({
    selector: 'app-changelog',
    
    standalone: true,
    templateUrl: './changelog.component.html',
    styleUrls: ['./changelog.component.css'],
    imports: [Ie11MarkdownComponent]
})
export class ChangelogComponent {
}
