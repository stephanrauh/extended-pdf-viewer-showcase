import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { AppCommonModule } from './app.common.module';
import { ExtendedPdfViewerMenuComponent } from './nav/extended-pdf-viewer-menu/extended-pdf-viewer-menu.component';
import { OctocatComponent } from './nav/octocat/octocat.component';


@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    OctocatComponent,
    ExtendedPdfViewerMenuComponent,
  ],
  imports: [
    AppCommonModule,
    FlexLayoutModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
