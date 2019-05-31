import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SimpleComponent } from './simple/simple.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavComponent } from './nav/nav.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LayoutModule } from '@angular/cdk/layout';
import {
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatCardModule,
  MatFormFieldModule,
  MatSelectModule,
  MatTabsModule
} from '@angular/material';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { I18nComponent } from './i18n/i18n.component';
import { PagesLoadedComponent } from './pages-loaded/pages-loaded.component';
import { TroubleshootingComponent } from './troubleshooting/troubleshooting.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { MarkdownModule } from 'ngx-markdown';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    SimpleComponent,
    I18nComponent,
    PagesLoadedComponent,
    TroubleshootingComponent,
    GettingStartedComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    LayoutModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
    NgxExtendedPdfViewerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
