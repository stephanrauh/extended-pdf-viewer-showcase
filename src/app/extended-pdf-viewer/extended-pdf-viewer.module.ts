import { NgModule } from '@angular/core';

import { ExtendedPdfViewerRoutingModule } from './extended-pdf-viewer-routing.module';
import { SimpleComponent } from './simple/simple.component';
import { SharedModule } from '../shared/shared.module';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AttributesComponent } from './attributes/attributes.component';
import { Base64Component } from './base64/base64.component';
import { BlobComponent } from './blob/blob.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { ContextmenuComponent } from './contextmenu/contextmenu.component';
import { DefaultOptionsComponent } from './default-options/default-options.component';
import { CustomPrintDialogComponent } from './custom-print-dialog/custom-print-dialog.component';
import { DisplayOptionsComponent } from './display-options/display-options.component';
import { ExportComponent } from './export/export.component';
import { FileInfoComponent } from './file-info/file-info.component';
import { FindComponent } from './find/find.component';
import { FormsComponent } from './forms/forms.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { HidingButtonsComponent } from './hiding-buttons/hiding-buttons.component';
import { I18nComponent } from './i18n/i18n.component';
import { IconInfoComponent } from './icons/icon-info/icon-info.component';
import { InfiniteScrollComponent } from './infinite-scroll/infinite-scroll.component';
import { IntroComponent } from './intro/intro.component';
import { KeyboardComponent } from './keyboard/keyboard.component';
import { KeycloakComponent } from './keycloak/keycloak.component';
import { LayersComponent } from './layers/layers.component';
import { LinksComponent } from './links/links.component';
import { MobileComponent } from './mobile/mobile.component';
import { MultipleDocumentsComponent } from './multiple-documents/multiple-documents.component';
import { PageViewModeComponent } from './page-view-mode/page-view-mode.component';
import { PagesLoadedComponent } from './pages-loaded/pages-loaded.component';
import { PdfjsVersionsComponent } from './pdfjs-versions/pdfjs-versions.component';
import { PerfectScrollbarComponent } from './perfect-scrollbar/perfect-scrollbar.component';
import { PrintRangeComponent } from './print-range/print-range.component';
import { RangeRequestsComponent } from './range-requests/range-requests.component';
import { SignaturesComponent } from './signatures/signatures.component';
import { SmartphoneComponent } from './smartphone/smartphone.component';
import { TextlayerComponent } from './textlayer/textlayer.component';
import { TouchGesturesComponent } from './touch-gestures/touch-gestures.component';
import { TroubleshootingComponent } from './troubleshooting/troubleshooting.component';
import { ZoomComponent } from './zoom/zoom.component';
import { CustomSidebarComponent } from './custom-sidebar/custom-sidebar.component';
import { CustomThumbnailsComponent } from './custom-thumbnails/custom-thumbnails.component';
import { CustomizationComponent } from './customization/customization.component';
import { TreeComponent } from './customization/tree/tree.component';
import { CustomToolbarComponent } from './custom-toolbar/custom-toolbar.component';
import { OpenInNewTabComponent } from './custom-toolbar/open-in-new-tab/open-in-new-tab.component';

@NgModule({
  imports: [
    ExtendedPdfViewerRoutingModule,
    SharedModule,
    NgxExtendedPdfViewerModule,
  ],
  declarations: [
    SimpleComponent,
    AttributesComponent,
    Base64Component,
    BlobComponent,
    ChangelogComponent,
    ContextmenuComponent,
    DefaultOptionsComponent,
    CustomizationComponent,
    CustomSidebarComponent,
    CustomThumbnailsComponent,
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
})
export class ExtendedPdfViewerModule {}
