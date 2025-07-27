import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-side-by-side',

    standalone: true,
    templateUrl: './side-by-side.component.html',
    styleUrls: ['./side-by-side.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        Ie11MarkdownComponent,
        AsyncPipe,
    ],
})
export class SideBySideComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  public fullscreenService = inject(FullscreenService);
  public sidebysidecomponentTab: string = 'displayingpdffilessidebyside';
  public codeTab: string = 'usingtheiframecomponent';
}
