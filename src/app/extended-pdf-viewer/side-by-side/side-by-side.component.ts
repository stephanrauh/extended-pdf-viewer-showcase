import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';
import { isBleedingEdge, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
    selector: 'app-side-by-side',

    standalone: true,
    templateUrl: './side-by-side.component.html',
    styleUrls: ['./side-by-side.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        Ie11MarkdownComponent,
        AsyncPipe,
        NgxExtendedPdfViewerModule,
    ],
})
export class SideBySideComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  public fullscreenService = inject(FullscreenService);
  // several viewers on one page need the bleeding-edge bundle (#3306)
  public readonly bleedingEdge = isBleedingEdge();
  // each version opens the description of the approach its demo shows
  public sidebysidecomponentTab: string = this.bleedingEdge ? 'severalviewers' : 'iframes';
  public codeTab: string = this.bleedingEdge ? 'twoviewers' : 'usingtheiframecomponent';
}
