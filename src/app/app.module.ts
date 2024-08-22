import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';

import { AppCommonModule } from './app.common.module';
import { ExtendedPdfViewerMenuComponent } from './nav/extended-pdf-viewer-menu/extended-pdf-viewer-menu.component';
import { OctocatComponent } from './nav/octocat/octocat.component';
import { GettingStartedComponent } from './nav/getting-started/getting-started.component';
import { provideClientHydration } from '@angular/platform-browser';


@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    OctocatComponent,
    ExtendedPdfViewerMenuComponent,
    GettingStartedComponent
  ],
  imports: [
    AppCommonModule,
    AppRoutingModule,
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
