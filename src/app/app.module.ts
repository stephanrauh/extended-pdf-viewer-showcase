import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';

import { SharedModule } from './shared/shared.module';
import { OctocatComponent } from './nav/octocat/octocat.component';
import { BrowserModule } from '@angular/platform-browser';
import { ExtendedPdfViewerMenuComponent } from './nav/extended-pdf-viewer-menu/extended-pdf-viewer-menu.component';
import { Ng2PdfViewerMenuComponent } from './nav/ng2-pdf-viewer-menu/ng2-pdf-viewer-menu.component';


@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    OctocatComponent,
    ExtendedPdfViewerMenuComponent,
    Ng2PdfViewerMenuComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    SharedModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
