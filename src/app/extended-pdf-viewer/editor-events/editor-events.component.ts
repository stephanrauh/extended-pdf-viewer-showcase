import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { PagesLoadedEvent, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard, MatCardHeader, MatCardContent } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-editor-events',
    templateUrl: './editor-events.component.html',
    styleUrls: ['./editor-events.component.css'],
    imports: [
        MatCard,
        MatTabGroup,
        MatTab,
        Ie11MarkdownComponent,
        MatCardHeader,
        MatIconButton,
        MatIcon,
        MatCardContent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class EditorEventsComponent {
  public fullscreenService = inject(FullscreenService);
  public messages: string[] = [];

  private changeDetector = inject(ChangeDetectorRef);

  public onEvent(type: string, event: any): void {
      const now = new Date().toLocaleTimeString();
      let e = '(no parameters)';
      if (event) {
        if (event.source) {
          event.source = undefined;
        }
        try {
          e = 'Event type: ' + event.constructor.name + ' Event: ' + JSON.stringify(event).substring(0, 60);
        } catch {
          e = 'Event type: ' + event.constructor.name + ' Event: ' + event;
        }
      }
      this.messages.push(`${now} ${type} ${e}`);
      this.changeDetector.detectChanges();
  }

  public onPagesLoaded(pagecount: PagesLoadedEvent): void {
    const now = new Date().toLocaleTimeString();
    this.messages.push(`${now} Loaded a document with ${pagecount.pagesCount} pages`);
  }

  public onPdfLoadingFailed(error: Error): void {
    const now = new Date().toLocaleTimeString();
    this.messages.push(`${now} Failed to load a PDF document ${error}`);
  }
}
