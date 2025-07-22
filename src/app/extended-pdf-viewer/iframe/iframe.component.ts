import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CopyrightComponent } from '../common/copyright.component';
import { FullscreenButtonComponent } from '../../components/fullscreen-button/fullscreen-button.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
    selector: 'app-iframe',
    
    standalone: true,
    templateUrl: './iframe.component.html',
    styleUrls: ['./iframe.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CopyrightComponent,
        FullscreenButtonComponent,
        NgxExtendedPdfViewerModule,
    ],
})
export class IFrameComponent {
  public url = '';

  constructor() {
    if (!this.isBrowser()) {
      this.url = '/assets/pdfs/CDK.pdf';
    } else if (location.pathname.endsWith('cdk')) {
      this.url = '/assets/pdfs/CDK.pdf';
    } else {
      this.url = '/assets/pdfs/GraalVM.pdf';
    }
  }

  /**
   * Checks if the code is running in a browser environment.
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }
}
