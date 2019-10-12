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
  MatInputModule,
  MatListModule,
  MatCardModule,
  MatFormFieldModule,
  MatSelectModule,
  MatTabsModule,
  MatRadioModule,
  MatCheckboxModule,
  MatProgressBarModule
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
import { Base64Component } from './base64/base64.component';
import { ResponsiveDesignComponent } from './responsive-design/responsive-design.component';
import { SmartphoneComponent } from './smartphone/smartphone.component';
import { ContextmenuComponent } from './contextmenu/contextmenu.component';
import { CustomPrintDialogComponent } from './custom-print-dialog/custom-print-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    AlternativesComponent,
    AttributesComponent,
    Base64Component,
    ContextmenuComponent,
    FindComponent,
    GettingStartedComponent,
    I18nComponent,
    IntroComponent,
    HidingButtonsComponent,
    MultipleDocumentsComponent,
    MobileComponent,
    PagesLoadedComponent,
    RangeRequestsComponent,
    ResponsiveDesignComponent,
    SimpleComponent,
    SmartphoneComponent,
    TroubleshootingComponent,
    ZoomComponent,
    CustomPrintDialogComponent
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
    MatFormFieldModule,
    MatSidenavModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatTabsModule,
    MatProgressBarModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
    NgxExtendedPdfViewerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
