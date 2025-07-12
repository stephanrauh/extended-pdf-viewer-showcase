import { NgModule } from '@angular/core';
import { PasswordsComponent } from './passwords/passwords.component';

import { NgxExtendedPdfViewerModule, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { SharedModule } from '../shared/shared.module';
import { TouchEmulator } from '../touch-emulator';
import { AttributesComponent } from './attributes/attributes.component';
import { CustomRenderComponent } from './attributes/custom-render-component';
import { Base64Component } from './base64/base64.component';
import { BlobComponent } from './blob/blob.component';
import { BookModeComponent } from './book-mode/book-mode.component';
import { BrowserSupportComponent } from './browser-support/browser-support.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { ContextmenuComponent } from './contextmenu/contextmenu.component';
import { CustomPrintDialogComponent } from './custom-print-dialog/custom-print-dialog.component';
import { CustomSidebarComponent } from './custom-sidebar/custom-sidebar.component';
import { CustomThumbnailsComponent } from './custom-thumbnails/custom-thumbnails.component';
import { CustomToolbarComponent } from './custom-toolbar/custom-toolbar.component';
import { OpenInNewTabComponent } from './custom-toolbar/open-in-new-tab/open-in-new-tab.component';
import { CustomizationComponent } from './customization/customization.component';
import { TreeComponent } from './customization/tree/tree.component';
import { DefaultOptionsComponent } from './default-options/default-options.component';
import { DisplayOptionsComponent } from './display-options/display-options.component';
import { ExportFileComponent } from './export-file/export-file.component';
import { ExportImageComponent } from './export-image/export-image.component';
import { ExportTextComponent } from './export-text/export-text.component';
import { ExtendedPdfViewerRoutingModule } from './extended-pdf-viewer-routing.module';
import { FileInfoComponent } from './file-info/file-info.component';
import { FilteringConsoleLogComponent } from './filtering-console-log/filtering-console-log.component';
import { FindComponent } from './find/find.component';
import { FormsComponent } from './forms/forms.component';
import { HidingButtonsComponent } from './hiding-buttons/hiding-buttons.component';
import { I18nComponent } from './i18n/i18n.component';
import { IconInfoComponent } from './icons/icon-info/icon-info.component';
import { IFrameComponent } from './iframe/iframe.component';
import { InfiniteScrollComponent } from './infinite-scroll/infinite-scroll.component';
import { IntroComponent } from './intro/intro.component';
import { KeyboardComponent } from './keyboard/keyboard.component';
import { KeycloakComponent } from './keycloak/keycloak.component';
import { LayersComponent } from './layers/layers.component';
import { LinksComponent } from './links/links.component';
import { MobileComponent } from './mobile/mobile.component';
import { MultipleDocumentsComponent } from './multiple-documents/multiple-documents.component';
import { NavigationComponent } from './navigation/navigation.component';
import { PageViewModeComponent } from './page-view-mode/page-view-mode.component';
import { PagesLoadedComponent } from './pages-loaded/pages-loaded.component';
import { PdfjsVersionsComponent } from './pdfjs-versions/pdfjs-versions.component';
import { PerfectScrollbarComponent } from './perfect-scrollbar/perfect-scrollbar.component';
import { PrerenderingComponent } from './prerendering/prerendering.component';
import { PresentationComponent } from './presentations/presentations.component';
import { PrintRangeComponent } from './print-range/print-range.component';
import { RangeRequestsComponent } from './range-requests/range-requests.component';
import { ScriptingComponent } from './scripting/scripting.component';
import { ScrollingComponent } from './scrolling/scrolling.component';
import { ServerSideRenderingComponent } from './server-side-rendering/server-side-rendering.component';
import { SideBySideComponent } from './side-by-side/side-by-side.component';
import { SignaturesComponent } from './signatures/signatures.component';
import { SimpleComponent } from './simple/simple.component';
import { SmartphoneComponent } from './smartphone/smartphone.component';
import { TextlayerComponent } from './textlayer/textlayer.component';
import { ThemingComponent } from './theming/theming.component';
import { TouchGesturesComponent } from './touch-gestures/touch-gestures.component';
import { TroubleshootingComponent } from './troubleshooting/troubleshooting.component';
import { TwoWayBindingComponent } from './two-way-binding/two-way-binding.component';
import { ZoomComponent } from './zoom/zoom.component';
import { ExportAnnotationsComponent } from './export-annotations/export-annotations.component';
import { ResponsiveDesignComponent } from './responsive-design/responsive-design.component';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { ModalComponent } from './modal/modal.component';
import { CSSComponent } from './css/css.component';
import { AnnotationLayerComponent } from './annotation-layer/annotation-layer.component';
import { SecurityComponent } from './security/security.component';
import { AnnotationLayerApiComponent } from './annotation-layer-api/annotation-layer-api.component';
import { EditorSettingsComponent } from './editor-settings/editor-settings.component';
import { CustomFindComponent } from './custom-find/custom-find.component';
import { isLocalhost } from './common/utilities';
import { CSPComponent } from './csp/csp.component';
import { EditorEventsComponent } from './editor-events/editor-events.component';
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { CopyrightComponent } from './common/copyright.component';


new TouchEmulator();

pdfDefaultOptions._internalFilenameSuffix = isLocalhost()? '' : '.min';

@NgModule({
  imports: [ExtendedPdfViewerRoutingModule, SharedModule, NgxExtendedPdfViewerModule],
  declarations: [
    AnnotationLayerComponent,
    AnnotationLayerApiComponent,
    AttributesComponent,
    Base64Component,
    BlobComponent,
    BookModeComponent,
    BrowserSupportComponent,
    ChangelogComponent,
    ContextmenuComponent,
    CopyrightComponent,
    CSPComponent,
    CSSComponent,
    CustomizationComponent,
    CustomPrintDialogComponent,
    CustomRenderComponent,
    CustomSidebarComponent,
    CustomFindComponent,
    CustomThumbnailsComponent,
    CustomToolbarComponent,
    DefaultOptionsComponent,
    DisplayOptionsComponent,
    EditorSettingsComponent,
    EditorEventsComponent,
    ExportAnnotationsComponent,
    ExportFileComponent,
    ExportImageComponent,
    ExportTextComponent,
    FileInfoComponent,
    FilteringConsoleLogComponent,
    FindComponent,
    FormsComponent,
    HidingButtonsComponent,
    I18nComponent,
    IconInfoComponent,
    IFrameComponent,
    InfiniteScrollComponent,
    IntroComponent,
    KeyboardComponent,
    KeycloakComponent,
    LayersComponent,
    LinksComponent,
    LoadingIndicatorComponent,
    MobileComponent,
    ModalComponent,
    ModalDialogComponent,
    MultipleDocumentsComponent,
    NavigationComponent,
    OpenInNewTabComponent,
    PagesLoadedComponent,
    PageViewModeComponent,
    PasswordsComponent,
    PdfjsVersionsComponent,
    PerfectScrollbarComponent,
    PrerenderingComponent,
    PresentationComponent,
    PrintRangeComponent,
    RangeRequestsComponent,
    ResponsiveDesignComponent,
    ScriptingComponent,
    ScrollingComponent,
    SecurityComponent,
    ServerSideRenderingComponent,
    SideBySideComponent,
    SignaturesComponent,
    SimpleComponent,
    SmartphoneComponent,
    TextlayerComponent,
    ThemingComponent,
    TouchGesturesComponent,
    TreeComponent,
    TroubleshootingComponent,
    TwoWayBindingComponent,
    ZoomComponent,

  ],
})
export class ExtendedPdfViewerModule {}
