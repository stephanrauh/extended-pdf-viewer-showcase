import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-side-by-side',
    templateUrl: './side-by-side.component.html',
    styleUrls: ['./side-by-side.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatCard,
        MatTabGroup,
        MatTab,
        Ie11MarkdownComponent,
        DemoComponent,
        AsyncPipe,
    ],
})
export class SideBySideComponent {
  public fullscreenService = inject(FullscreenService);
}
