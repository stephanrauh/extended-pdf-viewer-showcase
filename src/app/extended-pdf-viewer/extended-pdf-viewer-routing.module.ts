import { CustomBackgroundComponent } from './custom-background/custom-background.component';
import { MouseWheelComponent } from './mouse-wheel/mouse-wheel.component';
import { PasswordsComponent } from './passwords/passwords.component';
import { PerfectScrollbarComponent } from './perfect-scrollbar/perfect-scrollbar.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SimpleComponent } from './simple/simple.component';
import { AlternativesComponent } from '../shared/alternatives/alternatives.component';
import { AttributesComponent } from './attributes/attributes.component';
import { Base64Component } from './base64/base64.component';
import { BlobComponent } from './blob/blob.component';
import { PreloadGuard } from './blob/preload.guard';
import { ChangelogComponent } from './changelog/changelog.component';
import { ContextmenuComponent } from './contextmenu/contextmenu.component';
import { DefaultOptionsComponent } from './default-options/default-options.component';
import { CustomPrintDialogComponent } from './custom-print-dialog/custom-print-dialog.component';
import { CustomSidebarComponent } from './custom-sidebar/custom-sidebar.component';
import { CustomThumbnailsComponent } from './custom-thumbnails/custom-thumbnails.component';
import { CustomToolbarComponent } from './custom-toolbar/custom-toolbar.component';
import { CustomizationComponent } from './customization/customization.component';
import { DisplayOptionsComponent } from './display-options/display-options.component';
import { ExportComponent } from './export/export.component';
import { FileInfoComponent } from './file-info/file-info.component';
import { FindComponent } from './find/find.component';
import { FormsComponent } from './forms/forms.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { HidingButtonsComponent } from './hiding-buttons/hiding-buttons.component';
import { I18nComponent } from './i18n/i18n.component';
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
import { PrintRangeComponent } from './print-range/print-range.component';
import { RangeRequestsComponent } from './range-requests/range-requests.component';
import { SignaturesComponent } from './signatures/signatures.component';
import { SmartphoneComponent } from './smartphone/smartphone.component';
import { TextlayerComponent } from './textlayer/textlayer.component';
import { TouchGesturesComponent } from './touch-gestures/touch-gestures.component';
import { TroubleshootingComponent } from './troubleshooting/troubleshooting.component';
import { ZoomComponent } from './zoom/zoom.component';
import { ScriptingComponent } from './scripting/scripting.component';
import { BookModeComponent } from './book-mode/book-mode.component';
import { PresentationComponent } from './presentations/presentations.component';
import { PrerenderingComponent } from './prerendering/prerendering.component';
import { TwoWayBindingComponent } from './two-way-binding/two-way-binding.component';
import { FilteringConsoleLogComponent } from './filtering-console-log/filtering-console-log.component';
import { NavigationComponent } from './navigation/navigation.component';
import { IFrameComponent } from './iframe/iframe.component';
import { SideBySideComponent } from './side-by-side/side-by-side.component';
import { ThemingComponent } from './theming/theming.component';
import { ScrollingComponent } from './scrolling/scrolling.component';
import { BrowserSupportComponent } from './browser-support/browser-support.component';

const routes: Routes = [
  {
    path: 'simple',
    component: SimpleComponent,
  },
  { path: 'alternatives', component: AlternativesComponent },
  { path: 'attributes', component: AttributesComponent },
  { path: 'base64', component: Base64Component },
  { path: 'blob', component: BlobComponent, canActivate: [PreloadGuard] },
  { path: 'browser-support', component: BrowserSupportComponent},
  { path: 'changelog', component: ChangelogComponent },
  { path: 'changelog', component: ChangelogComponent },
  { path: 'contextmenu', component: ContextmenuComponent },
  { path: 'options', component: DefaultOptionsComponent },
  { path: 'customization', component: CustomizationComponent },
  { path: 'custom-background', component: CustomBackgroundComponent },
  { path: 'custom-print-dialog', component: CustomPrintDialogComponent },
  { path: 'custom-toolbar', component: CustomToolbarComponent },
  { path: 'custom-sidebar', component: CustomSidebarComponent },
  { path: 'custom-thumbnails', component: CustomThumbnailsComponent },
  { path: 'display-options', component: DisplayOptionsComponent },
  { path: 'export', component: ExportComponent },
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
  { path: 'links', component: LinksComponent },
  { path: 'keyboard', component: KeyboardComponent },
  { path: 'keycloak', component: KeycloakComponent },
  { path: 'mobile', component: MobileComponent },
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
  { path: 'side-by-side', component: SideBySideComponent },
  { path: 'signatures', component: SignaturesComponent },
  { path: 'simple', component: SimpleComponent },
  { path: 'smartphone', component: SmartphoneComponent },
  { path: 'textlayer', component: TextlayerComponent },
  { path: 'theming', component: ThemingComponent },
  { path: 'touch-gestures', component: TouchGesturesComponent },
  { path: 'troubleshooting', component: TroubleshootingComponent },
  { path: 'two-way-binding', component: TwoWayBindingComponent },
  { path: 'wheel', component: MouseWheelComponent },
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
