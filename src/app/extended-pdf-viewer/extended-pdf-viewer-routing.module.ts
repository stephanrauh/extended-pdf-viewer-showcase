import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PasswordsComponent } from './passwords/passwords.component';
import { PerfectScrollbarComponent } from './perfect-scrollbar/perfect-scrollbar.component';

import { AlternativesComponent } from '../shared/alternatives/alternatives.component';
import { AttributesComponent } from './attributes/attributes.component';
import { Base64Component } from './base64/base64.component';
import { BlobComponent } from './blob/blob.component';
import { preloadGuard } from './blob/preload.guard';
import { BookModeComponent } from './book-mode/book-mode.component';
import { BrowserSupportComponent } from './browser-support/browser-support.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { ContextmenuComponent } from './contextmenu/contextmenu.component';
import { CustomPrintDialogComponent } from './custom-print-dialog/custom-print-dialog.component';
import { CustomSidebarComponent } from './custom-sidebar/custom-sidebar.component';
import { CustomThumbnailsComponent } from './custom-thumbnails/custom-thumbnails.component';
import { CustomToolbarComponent } from './custom-toolbar/custom-toolbar.component';
import { CustomizationComponent } from './customization/customization.component';
import { DefaultOptionsComponent } from './default-options/default-options.component';
import { DisplayOptionsComponent } from './display-options/display-options.component';
import { ExportFileComponent } from './export-file/export-file.component';
import { ExportImageComponent } from './export-image/export-image.component';
import { ExportTextComponent } from './export-text/export-text.component';
import { FileInfoComponent } from './file-info/file-info.component';
import { FilteringConsoleLogComponent } from './filtering-console-log/filtering-console-log.component';
import { FindComponent } from './find/find.component';
import { FormsComponent } from './forms/forms.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { HidingButtonsComponent } from './hiding-buttons/hiding-buttons.component';
import { I18nComponent } from './i18n/i18n.component';
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
import { ModalComponent } from './modal/modal.component';
import { CSSComponent } from './css/css.component';
import { AnnotationLayerComponent } from './annotation-layer/annotation-layer.component';
import { SecurityComponent } from './security/security.component';

const routes: Routes = [
  {
    path: 'simple',
    component: SimpleComponent,
  },
  { path: 'alternatives', component: AlternativesComponent },
  { path: 'annotation-layer', component: AnnotationLayerComponent },
  { path: 'attributes', component: AttributesComponent },
  { path: 'base64', component: Base64Component },
  { path: 'blob', component: BlobComponent, canActivate: [preloadGuard] },
  { path: 'browser-support', component: BrowserSupportComponent },
  { path: 'changelog', component: ChangelogComponent },
  { path: 'changelog', component: ChangelogComponent },
  { path: 'contextmenu', component: ContextmenuComponent },
  { path: 'css', component: CSSComponent },
  { path: 'options', component: DefaultOptionsComponent },
  { path: 'customization', component: CustomizationComponent },
  { path: 'custom-print-dialog', component: CustomPrintDialogComponent },
  { path: 'custom-toolbar', component: CustomToolbarComponent },
  { path: 'custom-sidebar', component: CustomSidebarComponent },
  { path: 'custom-thumbnails', component: CustomThumbnailsComponent },
  { path: 'display-options', component: DisplayOptionsComponent },
  { path: 'export-file', component: ExportFileComponent },
  { path: 'export-image', component: ExportImageComponent },
  { path: 'export-text', component: ExportTextComponent },
  { path: 'export-annotations', component: ExportAnnotationsComponent },
  { path: 'file-info', component: FileInfoComponent },
  { path: 'filtering-console-log', component: FilteringConsoleLogComponent },
  { path: 'forms', component: FormsComponent },
  { path: 'layers', component: LayersComponent },
  { path: 'getting-started', component: GettingStartedComponent },
  { path: 'find', component: FindComponent },
  { path: 'i18n', component: I18nComponent },
  { path: 'infinite-scroll', component: InfiniteScrollComponent },
  { path: 'book-mode', component: BookModeComponent },
  { path: 'iframe/:id', component: IFrameComponent },
  { path: 'intro', component: IntroComponent },
  { path: 'hiding-buttons', component: HidingButtonsComponent },
  { path: 'responsive-design', component: ResponsiveDesignComponent },
  { path: 'links', component: LinksComponent },
  { path: 'keyboard', component: KeyboardComponent },
  { path: 'keycloak', component: KeycloakComponent },
  { path: 'mobile', component: MobileComponent },
  { path: 'modal', component: ModalComponent },
  { path: 'multiple-documents', component: MultipleDocumentsComponent },
  { path: 'navigation', component: NavigationComponent },
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
  { path: 'simple', component: SimpleComponent },
  { path: 'smartphone', component: SmartphoneComponent },
  { path: 'textlayer', component: TextlayerComponent },
  { path: 'theming', component: ThemingComponent },
  { path: 'touch-gestures', component: TouchGesturesComponent },
  { path: 'troubleshooting', component: TroubleshootingComponent },
  { path: 'two-way-binding', component: TwoWayBindingComponent },
  { path: 'zoom', component: ZoomComponent },
  {
    path: '**',
    redirectTo: 'simple',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExtendedPdfViewerRoutingModule {}
