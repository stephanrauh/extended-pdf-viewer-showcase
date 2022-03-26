import { Ng2AttributesComponent } from './ng2-attributes/ng2-attributes.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { Ng2PdfViewerRoutingModule } from './ng2-pdf-viewer-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ChangelogComponent } from './changelog/changelog.component';
import { Ng2SimpleComponent } from './ng2-simple/ng2-simple.component';
import { IntroductionComponent } from './introduction/introduction.component';
import { Ng2ShowAllComponent } from './ng2-show-all/ng2-show-all.component';
import { Ng2ZoomComponent } from './ng2-zoom/ng2-zoom.component';
import { Ng2BordersComponent } from './ng2-border/ng2-borders.component';
import { Ng2EventsComponent } from './ng2-events/ng2-events.component';
import { Ng2LinksCallAngularComponent } from './ng2-links-call-angular/ng2-links-call-angular.component';
import { Ng2SideBySideComponent } from './ng2-side-by-side/ng2-side-by-side.component';

@NgModule({
  declarations: [
    GettingStartedComponent,
    ChangelogComponent,
    Ng2SimpleComponent,
    IntroductionComponent,
    Ng2BordersComponent,
    Ng2ShowAllComponent,
    Ng2ZoomComponent,
    Ng2AttributesComponent,
    Ng2EventsComponent,
    Ng2LinksCallAngularComponent,
    Ng2SideBySideComponent
  ],
  imports: [
    CommonModule,
    PdfViewerModule,
    SharedModule,
    Ng2PdfViewerRoutingModule,
  ],
})
export class Ng2PdfViewerModule {}
