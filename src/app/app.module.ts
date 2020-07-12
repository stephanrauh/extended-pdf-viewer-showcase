import { ExportComponent } from './export/export.component';
import { PrintRangeComponent } from './print-range/print-range.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SimpleComponent } from './simple/simple.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavComponent } from './nav/nav.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
import { SmartphoneComponent } from './smartphone/smartphone.component';
import { ContextmenuComponent } from './contextmenu/contextmenu.component';
import { CustomPrintDialogComponent } from './custom-print-dialog/custom-print-dialog.component';
import { KeyboardComponent } from './keyboard/keyboard.component';
import { DisplayOptionsComponent } from './display-options/display-options.component';
import { CustomToolbarComponent } from './custom-toolbar/custom-toolbar.component';
import { CustomizationComponent } from './customization/customization.component';
import { IconInfoComponent } from './icons/icon-info/icon-info.component';
import { TreeComponent } from './customization/tree/tree.component';
import { PerfectScrollbarComponent } from './perfect-scrollbar/perfect-scrollbar.component';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { OpenInNewTabComponent } from './custom-toolbar/open-in-new-tab/open-in-new-tab.component';
import { LinksComponent } from './links/links.component';
import { TextlayerComponent } from './textlayer/textlayer.component';
import { TouchGesturesComponent } from './touch-gestures/touch-gestures.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { DefaultOptionsComponent } from './default-options/default-options.component';
import { PdfjsVersionsComponent } from './pdfjs-versions/pdfjs-versions.component';
import { KeycloakComponent } from './keycloak/keycloak.component';
import { CustomSidebarComponent } from './custom-sidebar/custom-sidebar.component';
import { CustomThumbnailsComponent } from './custom-thumbnails/custom-thumbnails.component';


@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    AlternativesComponent,
    AttributesComponent,
    ChangelogComponent,
    CustomizationComponent,
    CustomSidebarComponent,
    CustomThumbnailsComponent,
    DefaultOptionsComponent,
    Base64Component,
    ContextmenuComponent,
    ExportComponent,
    FindComponent,
    GettingStartedComponent,
    I18nComponent,
    IntroComponent,
    HidingButtonsComponent,
    KeycloakComponent,
    MultipleDocumentsComponent,
    MobileComponent,
    PagesLoadedComponent,
    PdfjsVersionsComponent,
    PrintRangeComponent,
    RangeRequestsComponent,
    SimpleComponent,
    SmartphoneComponent,
    TextlayerComponent,
    TouchGesturesComponent,
    TroubleshootingComponent,
    ZoomComponent,
    CustomPrintDialogComponent,
    LinksComponent,
    KeyboardComponent,
    DisplayOptionsComponent,
    CustomToolbarComponent,
    IconInfoComponent,
    TreeComponent,
    PerfectScrollbarComponent,
    OpenInNewTabComponent
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
    MatSnackBarModule,
    MatRadioModule,
    MatTabsModule,
    MatTreeModule,
    MatTooltipModule,
    MatProgressBarModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
    NgxExtendedPdfViewerModule,
    PerfectScrollbarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
