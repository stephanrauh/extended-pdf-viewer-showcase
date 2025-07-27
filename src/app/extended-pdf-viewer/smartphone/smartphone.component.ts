import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-smartphone',

  standalone: true,
  templateUrl: './smartphone.component.html',
  styleUrls: ['./smartphone.component.css', './devices.min.css'],
  imports: [Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, AsyncPipe],
})
export class SmartphoneComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  public fullscreenService = inject(FullscreenService);

  public activeTab = 'html';
}
