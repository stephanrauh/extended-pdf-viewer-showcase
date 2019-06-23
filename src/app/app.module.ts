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
  MatTabsModule,
  MatRadioModule,
  MatCheckboxModule
} from '@angular/material';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { I18nComponent } from './i18n/i18n.component';
import { PagesLoadedComponent } from './pages-loaded/pages-loaded.component';
import { TroubleshootingComponent } from './troubleshooting/troubleshooting.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { MarkdownModule } from 'ngx-markdown';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ZoomComponent } from './zoom/zoom.component';
import { MobileComponent } from './mobile/mobile.component';
import { FormsModule } from '@angular/forms';
import { AttributesComponent } from './attributes/attributes.component';
import { IntroComponent } from './intro/intro.component';
import { AlternativesComponent } from './alternatives/alternatives.component';
import { RangeRequestsComponent } from './range-requests/range-requests.component';
import { FindComponent } from './find/find.component';
import { HidingButtonsComponent } from './hiding-buttons/hiding-buttons.component';
import { MultipleDocumentsComponent } from './multiple-documents/multiple-documents.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    AlternativesComponent,
    AttributesComponent,
    FindComponent,
    GettingStartedComponent,
    I18nComponent,
    IntroComponent,
    HidingButtonsComponent,
    MultipleDocumentsComponent,
    MobileComponent,
    PagesLoadedComponent,
    RangeRequestsComponent,
    SimpleComponent,
    TroubleshootingComponent,
    ZoomComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    LayoutModule,
    FlexLayoutModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatTabsModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
    NgxExtendedPdfViewerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
