import { LayersComponent } from './extended-pdf-viewer/layers/layers.component';
import { ExportComponent } from './extended-pdf-viewer/export/export.component';
import { PrintRangeComponent } from './extended-pdf-viewer/print-range/print-range.component';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SimpleComponent } from './extended-pdf-viewer/simple/simple.component';
import { NavComponent } from './nav/nav.component';
import { HttpClient } from '@angular/common/http';
import { I18nComponent } from './extended-pdf-viewer/i18n/i18n.component';
import { PagesLoadedComponent } from './extended-pdf-viewer/pages-loaded/pages-loaded.component';
import { TroubleshootingComponent } from './extended-pdf-viewer/troubleshooting/troubleshooting.component';
import { GettingStartedComponent } from './extended-pdf-viewer/getting-started/getting-started.component';
import { MarkdownModule } from 'ngx-markdown';
import { ZoomComponent } from './extended-pdf-viewer/zoom/zoom.component';
import { MobileComponent } from './extended-pdf-viewer/mobile/mobile.component';
import { AttributesComponent } from './extended-pdf-viewer/attributes/attributes.component';
import { IntroComponent } from './extended-pdf-viewer/intro/intro.component';
import { AlternativesComponent } from './extended-pdf-viewer/alternatives/alternatives.component';
import { RangeRequestsComponent } from './extended-pdf-viewer/range-requests/range-requests.component';
import { FindComponent } from './extended-pdf-viewer/find/find.component';
import { HidingButtonsComponent } from './extended-pdf-viewer/hiding-buttons/hiding-buttons.component';
import { MultipleDocumentsComponent } from './extended-pdf-viewer/multiple-documents/multiple-documents.component';
import { Base64Component } from './extended-pdf-viewer/base64/base64.component';
import { BlobComponent } from './extended-pdf-viewer/blob/blob.component';
import { SmartphoneComponent } from './extended-pdf-viewer/smartphone/smartphone.component';
import { ContextmenuComponent } from './extended-pdf-viewer/contextmenu/contextmenu.component';
import { CustomPrintDialogComponent } from './extended-pdf-viewer/custom-print-dialog/custom-print-dialog.component';
import { KeyboardComponent } from './extended-pdf-viewer/keyboard/keyboard.component';
import { DisplayOptionsComponent } from './extended-pdf-viewer/display-options/display-options.component';
import { CustomToolbarComponent } from './extended-pdf-viewer/custom-toolbar/custom-toolbar.component';
import { CustomizationComponent } from './extended-pdf-viewer/customization/customization.component';
import { IconInfoComponent } from './extended-pdf-viewer/icons/icon-info/icon-info.component';
import { TreeComponent } from './extended-pdf-viewer/customization/tree/tree.component';
import { PerfectScrollbarComponent } from './extended-pdf-viewer/perfect-scrollbar/perfect-scrollbar.component';

import { OpenInNewTabComponent } from './extended-pdf-viewer/custom-toolbar/open-in-new-tab/open-in-new-tab.component';
import { LinksComponent } from './extended-pdf-viewer/links/links.component';
import { TextlayerComponent } from './extended-pdf-viewer/textlayer/textlayer.component';
import { TouchGesturesComponent } from './extended-pdf-viewer/touch-gestures/touch-gestures.component';
import { ChangelogComponent } from './extended-pdf-viewer/changelog/changelog.component';
import { DefaultOptionsComponent } from './extended-pdf-viewer/default-options/default-options.component';
import { PdfjsVersionsComponent } from './extended-pdf-viewer/pdfjs-versions/pdfjs-versions.component';
import { KeycloakComponent } from './extended-pdf-viewer/keycloak/keycloak.component';
import { CustomSidebarComponent } from './extended-pdf-viewer/custom-sidebar/custom-sidebar.component';
import { CustomThumbnailsComponent } from './extended-pdf-viewer/custom-thumbnails/custom-thumbnails.component';
import { FormsComponent } from './extended-pdf-viewer/forms/forms.component';
import { PageViewModeComponent } from './extended-pdf-viewer/page-view-mode/page-view-mode.component';
import { SignaturesComponent } from './extended-pdf-viewer/signatures/signatures.component';
import { InfiniteScrollComponent } from './extended-pdf-viewer/infinite-scroll/infinite-scroll.component';
import { FileInfoComponent } from './extended-pdf-viewer/file-info/file-info.component';
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
