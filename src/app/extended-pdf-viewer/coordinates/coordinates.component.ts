import { Component } from '@angular/core';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-coordinates',
  standalone: true,
  templateUrl: './coordinates.component.html',
  styleUrls: ['./coordinates.component.css'],
  imports: [Ie11MarkdownComponent, RouterLink],
})
export class CoordinatesComponent {}
