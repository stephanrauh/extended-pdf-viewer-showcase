import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-iframe',
  templateUrl: './iframe.component.html',
  styleUrls: ['./iframe.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IFrameComponent {
  public url = "";

  constructor() {
    if (location.pathname.endsWith("cdk")) {
        this.url="/assets/pdfs/CDK.pdf";
    } else {
      this.url="/assets/pdfs/GraalVM.pdf";
    }
  }
}
