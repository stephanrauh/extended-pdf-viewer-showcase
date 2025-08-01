import { Routes } from '@angular/router';
import { DefaultRoutesComponent } from './shared/default-routes/default-routes.component';
import { GettingStartedComponent } from './nav/getting-started/getting-started.component';

// Import all the component routes from extended-pdf-viewer-routing
import { PasswordsComponent } from './extended-pdf-viewer/passwords/passwords.component';
import { PerfectScrollbarComponent } from './extended-pdf-viewer/perfect-scrollbar/perfect-scrollbar.component';
import { AlternativesComponent } from './shared/alternatives/alternatives.component';
import { AttributesComponent } from './extended-pdf-viewer/attributes/attributes.component';
import { Base64Component } from './extended-pdf-viewer/base64/base64.component';
import { BlobComponent } from './extended-pdf-viewer/blob/blob.component';
import { preloadGuard } from './extended-pdf-viewer/blob/preload.guard';
import { BookModeComponent } from './extended-pdf-viewer/book-mode/book-mode.component';
import { BrowserSupportComponent } from './extended-pdf-viewer/browser-support/browser-support.component';
import { ChangelogComponent } from './extended-pdf-viewer/changelog/changelog.component';
import { ContextmenuComponent } from './extended-pdf-viewer/contextmenu/contextmenu.component';
import { CustomPrintDialogComponent } from './extended-pdf-viewer/custom-print-dialog/custom-print-dialog.component';
import { CustomSidebarComponent } from './extended-pdf-viewer/custom-sidebar/custom-sidebar.component';
import { CustomThumbnailsComponent } from './extended-pdf-viewer/custom-thumbnails/custom-thumbnails.component';
import { CustomToolbarComponent } from './extended-pdf-viewer/custom-toolbar/custom-toolbar.component';
import { CustomizationComponent } from './extended-pdf-viewer/customization/customization.component';
import { DefaultOptionsComponent } from './extended-pdf-viewer/default-options/default-options.component';
import { DisplayOptionsComponent } from './extended-pdf-viewer/display-options/display-options.component';
import { ExportFileComponent } from './extended-pdf-viewer/export-file/export-file.component';
import { ExportImageComponent } from './extended-pdf-viewer/export-image/export-image.component';
import { ExportTextComponent } from './extended-pdf-viewer/export-text/export-text.component';
import { FileInfoComponent } from './extended-pdf-viewer/file-info/file-info.component';
import { FilteringConsoleLogComponent } from './extended-pdf-viewer/filtering-console-log/filtering-console-log.component';
import { FindComponent } from './extended-pdf-viewer/find/find.component';
import { FormsComponent } from './extended-pdf-viewer/forms/forms.component';
import { HidingButtonsComponent } from './extended-pdf-viewer/hiding-buttons/hiding-buttons.component';
import { I18nComponent } from './extended-pdf-viewer/i18n/i18n.component';
import { IFrameComponent } from './extended-pdf-viewer/iframe/iframe.component';
import { InfiniteScrollComponent } from './extended-pdf-viewer/infinite-scroll/infinite-scroll.component';
import { IntroComponent } from './extended-pdf-viewer/intro/intro.component';
import { KeyboardComponent } from './extended-pdf-viewer/keyboard/keyboard.component';
import { KeycloakComponent } from './extended-pdf-viewer/keycloak/keycloak.component';
import { LayersComponent } from './extended-pdf-viewer/layers/layers.component';
import { LinksComponent } from './extended-pdf-viewer/links/links.component';
import { MobileComponent } from './extended-pdf-viewer/mobile/mobile.component';
import { MultipleDocumentsComponent } from './extended-pdf-viewer/multiple-documents/multiple-documents.component';
import { NavigationComponent } from './extended-pdf-viewer/navigation/navigation.component';
import { PageViewModeComponent } from './extended-pdf-viewer/page-view-mode/page-view-mode.component';
import { PagesLoadedComponent } from './extended-pdf-viewer/pages-loaded/pages-loaded.component';
import { PdfjsVersionsComponent } from './extended-pdf-viewer/pdfjs-versions/pdfjs-versions.component';
import { PrerenderingComponent } from './extended-pdf-viewer/prerendering/prerendering.component';
import { PresentationComponent } from './extended-pdf-viewer/presentations/presentations.component';
import { PrintRangeComponent } from './extended-pdf-viewer/print-range/print-range.component';
import { RangeRequestsComponent } from './extended-pdf-viewer/range-requests/range-requests.component';
import { ScriptingComponent } from './extended-pdf-viewer/scripting/scripting.component';
import { ScrollingComponent } from './extended-pdf-viewer/scrolling/scrolling.component';
import { ServerSideRenderingComponent } from './extended-pdf-viewer/server-side-rendering/server-side-rendering.component';
import { SideBySideComponent } from './extended-pdf-viewer/side-by-side/side-by-side.component';
import { SignaturesComponent } from './extended-pdf-viewer/signatures/signatures.component';
import { SimpleComponent } from './extended-pdf-viewer/simple/simple.component';
import { SmartphoneComponent } from './extended-pdf-viewer/smartphone/smartphone.component';
import { TextlayerComponent } from './extended-pdf-viewer/textlayer/textlayer.component';
import { ThemingComponent } from './extended-pdf-viewer/theming/theming.component';
import { TouchGesturesComponent } from './extended-pdf-viewer/touch-gestures/touch-gestures.component';
import { TroubleshootingComponent } from './extended-pdf-viewer/troubleshooting/troubleshooting.component';
import { TwoWayBindingComponent } from './extended-pdf-viewer/two-way-binding/two-way-binding.component';
import { ZoomComponent } from './extended-pdf-viewer/zoom/zoom.component';
import { ExportAnnotationsComponent } from './extended-pdf-viewer/export-annotations/export-annotations.component';
import { ResponsiveDesignComponent } from './extended-pdf-viewer/responsive-design/responsive-design.component';
import { ModalComponent } from './extended-pdf-viewer/modal/modal.component';
import { CSSComponent } from './extended-pdf-viewer/css/css.component';
import { AnnotationLayerComponent } from './extended-pdf-viewer/annotation-layer/annotation-layer.component';
import { SecurityComponent } from './extended-pdf-viewer/security/security.component';
import { AnnotationLayerApiComponent } from './extended-pdf-viewer/annotation-layer-api/annotation-layer-api.component';
import { EditorSettingsComponent } from './extended-pdf-viewer/editor-settings/editor-settings.component';
import { CustomFindComponent } from './extended-pdf-viewer/custom-find/custom-find.component';
import { CSPComponent } from './extended-pdf-viewer/csp/csp.component';
import { EditorEventsComponent } from './extended-pdf-viewer/editor-events/editor-events.component';
import { LoadingIndicatorComponent } from './extended-pdf-viewer/loading-indicator/loading-indicator.component';
import { ModifyingPageOrderComponent } from './extended-pdf-viewer/modifying-page-order/modifying-page-order.component';
import { AddingArbitraryAnnotationsComponent } from './extended-pdf-viewer/adding-arbitrary-annotations/adding-arbitrary-annotations.component';

export const routes: Routes = [
  { path: '', redirectTo: '/extended-pdf-viewer/simple', pathMatch: 'full' },
  { path: 'extended-pdf-viewer/getting-started', component: GettingStartedComponent },
  {
    path: 'extended-pdf-viewer',
    children: [
      { path: 'simple', component: SimpleComponent },
      { path: 'adding-arbitrary-annotations', component: AddingArbitraryAnnotationsComponent},
      { path: 'alternatives', component: AlternativesComponent },
      { path: 'annotation-layer', component: AnnotationLayerComponent },
      { path: 'annotation-layer-api', component: AnnotationLayerApiComponent },
      { path: 'attributes', component: AttributesComponent },
      { path: 'base64', component: Base64Component },
      { path: 'blob', component: BlobComponent, canActivate: [preloadGuard] },
      { path: 'browser-support', component: BrowserSupportComponent },
      { path: 'changelog', component: ChangelogComponent },
      { path: 'contextmenu', component: ContextmenuComponent },
      { path: 'csp', component: CSPComponent },
      { path: 'css', component: CSSComponent },
      { path: 'options', component: DefaultOptionsComponent },
      { path: 'customization', component: CustomizationComponent },
      { path: 'custom-print-dialog', component: CustomPrintDialogComponent },
      { path: 'custom-toolbar', component: CustomToolbarComponent },
      { path: 'custom-sidebar', component: CustomSidebarComponent },
      { path: 'custom-thumbnails', component: CustomThumbnailsComponent },
      { path: 'custom-find', component: CustomFindComponent },
      { path: 'display-options', component: DisplayOptionsComponent },
      { path: 'export-file', component: ExportFileComponent },
      { path: 'export-image', component: ExportImageComponent },
      { path: 'export-text', component: ExportTextComponent },
      { path: 'export-annotations', component: ExportAnnotationsComponent },
      { path: 'editor-setting', component: EditorSettingsComponent},
      {
        path: 'ngx-pdf-viewer-service',
        loadComponent: () =>
          import('./extended-pdf-viewer/ngx-pdf-viewer-service/ngx-pdf-viewer-service.component').then(
            (m) => m.NgxPdfViewerServiceComponent
          ),
      },
      { path: 'file-info', component: FileInfoComponent },
      { path: 'filtering-console-log', component: FilteringConsoleLogComponent },
      { path: 'forms', component: FormsComponent },
      { path: 'layers', component: LayersComponent },
      { path: 'find', component: FindComponent },
      { path: 'i18n', component: I18nComponent },
      { path: 'infinite-scroll', component: InfiniteScrollComponent },
      { path: 'book-mode', component: BookModeComponent },
      { path: 'iframe/:id', component: IFrameComponent },
      { path: 'intro', component: IntroComponent },
      { path: 'hiding-buttons', component: HidingButtonsComponent },
      { path: 'responsive-design', component: ResponsiveDesignComponent },
      { path: 'links', component: LinksComponent },
      { path: 'loading-indicator', component: LoadingIndicatorComponent},
      { path: 'keyboard', component: KeyboardComponent },
      { path: 'keycloak', component: KeycloakComponent },
      { path: 'mobile', component: MobileComponent },
      { path: 'modal', component: ModalComponent },
      { path: 'modify-page-order', component: ModifyingPageOrderComponent},
      { path: 'multiple-documents', component: MultipleDocumentsComponent },
      { path: 'navigation', component: NavigationComponent },
      { path: 'editor-events', component: EditorEventsComponent },
      { path: 'events', component: PagesLoadedComponent },
      { path: 'pages-loaded', component: PagesLoadedComponent },
      { path: 'passwords', component: PasswordsComponent },
      { path: 'pdfjs-versions', component: PdfjsVersionsComponent },
      { path: 'page-view-mode', component: PageViewModeComponent },
      { path: 'print-range', component: PrintRangeComponent },
      { path: 'perfect-scrollbar', component: PerfectScrollbarComponent },
      { path: 'presentations', component: PresentationComponent },
      { path: 'prerendering', component: PrerenderingComponent },
      { path: 'range-requests', component: RangeRequestsComponent },
      { path: 'scripting', component: ScriptingComponent },
      { path: 'scrolling', component: ScrollingComponent },
      { path: 'security', component: SecurityComponent },
      { path: 'server-side-rendering', component: ServerSideRenderingComponent },
      { path: 'side-by-side', component: SideBySideComponent },
      { path: 'signatures', component: SignaturesComponent },
      { path: 'smartphone', component: SmartphoneComponent },
      { path: 'textlayer', component: TextlayerComponent },
      { path: 'theming', component: ThemingComponent },
      { path: 'touch-gestures', component: TouchGesturesComponent },
      { path: 'troubleshooting', component: TroubleshootingComponent },
      { path: 'two-way-binding', component: TwoWayBindingComponent },
      { path: 'zoom', component: ZoomComponent },
      { path: '**', redirectTo: 'simple' }
    ]
  },
  { path: ':path', component: DefaultRoutesComponent },
  { path: '**', redirectTo: '/extended-pdf-viewer/simple', pathMatch: 'full' }
];
