import { LayersComponent } from './layers/layers.component';
import { ExportComponent } from './export/export.component';
import { PrintRangeComponent } from './print-range/print-range.component';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SimpleComponent } from './simple/simple.component';
import { NavComponent } from './nav/nav.component';
import { HttpClient } from '@angular/common/http';
import { I18nComponent } from './i18n/i18n.component';
import { PagesLoadedComponent } from './pages-loaded/pages-loaded.component';
import { TroubleshootingComponent } from './troubleshooting/troubleshooting.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { MarkdownModule } from 'ngx-markdown';
import { ZoomComponent } from './zoom/zoom.component';
import { MobileComponent } from './mobile/mobile.component';
import { AttributesComponent } from './attributes/attributes.component';
import { IntroComponent } from './intro/intro.component';
import { AlternativesComponent } from './alternatives/alternatives.component';
import { RangeRequestsComponent } from './range-requests/range-requests.component';
import { FindComponent } from './find/find.component';
import { HidingButtonsComponent } from './hiding-buttons/hiding-buttons.component';
import { MultipleDocumentsComponent } from './multiple-documents/multiple-documents.component';
import { Base64Component } from './base64/base64.component';
import { BlobComponent } from './blob/blob.component';
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
import { FormsComponent } from './forms/forms.component';
import { PageViewModeComponent } from './page-view-mode/page-view-mode.component';
import { SignaturesComponent } from './signatures/signatures.component';
import { InfiniteScrollComponent } from './infinite-scroll/infinite-scroll.component';
import { FileInfoComponent } from './file-info/file-info.component';
import { SharedModule } from './shared.module';
import { OctocatComponent } from './nav/octocat/octocat.component';


@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    OctocatComponent,
    AlternativesComponent,
    AttributesComponent,
    ChangelogComponent,
    CustomizationComponent,
    CustomSidebarComponent,
    CustomThumbnailsComponent,
    DefaultOptionsComponent,
    Base64Component,
    BlobComponent,
    ContextmenuComponent,
    ExportComponent,
    FileInfoComponent,
    FindComponent,
    GettingStartedComponent,
    I18nComponent,
    InfiniteScrollComponent,
    IntroComponent,
    HidingButtonsComponent,
    KeycloakComponent,
    MultipleDocumentsComponent,
    MobileComponent,
    PagesLoadedComponent,
    PageViewModeComponent,
    PdfjsVersionsComponent,
    PrintRangeComponent,
    RangeRequestsComponent,
    SignaturesComponent,
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
    OpenInNewTabComponent,
    FormsComponent,
    LayersComponent,
  ],
  imports: [
    SharedModule,
    AppRoutingModule,
    MarkdownModule.forRoot({ loader: HttpClient }),

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
