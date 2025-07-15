import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';

@Component({
    standalone: true,
    selector: 'app-getting-started',
    templateUrl: './getting-started.component.html',
    styleUrls: ['./getting-started.component.css'],
    imports: [MatCard, Ie11MarkdownComponent, MatTabGroup, MatTab]
})
export class GettingStartedComponent  {
}
