import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';

interface TroubleshootingTopic {
  id: string;
  title: string;
}

@Component({
  selector: 'app-troubleshooting',
  standalone: true,
  templateUrl: './troubleshooting.component.html',
  styleUrls: ['./troubleshooting.component.css'],
  imports: [Ie11MarkdownComponent, RouterLink],
})
export class TroubleshootingComponent {
  private readonly route = inject(ActivatedRoute);

  // Each topic has its own URL (/extended-pdf-viewer/troubleshooting/<id>), so you can link to it directly.
  public readonly topics: TroubleshootingTopic[] = [
    { id: 'overview', title: 'Overview' },
    { id: 'setup', title: 'Setup and installation' },
    { id: 'display', title: 'Display and layout' },
    { id: 'find-and-select', title: 'Find and select text' },
    { id: 'printing', title: 'Printing' },
    { id: 'browsers', title: 'Browsers and mobile' },
    { id: 'debugging', title: 'Debugging and bug reports' },
  ];

  public readonly activeTopic = toSignal(
    this.route.paramMap.pipe(
      map((params) => {
        const topic = params.get('topic');
        return this.topics.some((t) => t.id === topic) ? topic! : 'overview';
      }),
    ),
    { initialValue: 'overview' },
  );
}
