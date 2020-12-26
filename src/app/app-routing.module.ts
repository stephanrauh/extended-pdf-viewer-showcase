import { LayersComponent } from './extended-pdf-viewer/layers/layers.component';
import { ExportComponent } from './extended-pdf-viewer/export/export.component';
import { KeyboardComponent } from './extended-pdf-viewer/keyboard/keyboard.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GettingStartedComponent } from './extended-pdf-viewer/getting-started/getting-started.component';
import { I18nComponent } from './extended-pdf-viewer/i18n/i18n.component';
import { PagesLoadedComponent } from './extended-pdf-viewer/pages-loaded/pages-loaded.component';
import { SimpleComponent } from './extended-pdf-viewer/simple/simple.component';
import { TroubleshootingComponent } from './extended-pdf-viewer/troubleshooting/troubleshooting.component';
import { MobileComponent } from './extended-pdf-viewer/mobile/mobile.component';
import { ZoomComponent } from './extended-pdf-viewer/zoom/zoom.component';
import { AttributesComponent } from './extended-pdf-viewer/attributes/attributes.component';
import { IntroComponent } from './extended-pdf-viewer/intro/intro.component';
import { AlternativesComponent } from './extended-pdf-viewer/alternatives/alternatives.component';
import { RangeRequestsComponent } from './extended-pdf-viewer/range-requests/range-requests.component';
import { FindComponent } from './extended-pdf-viewer/find/find.component';
import { MultipleDocumentsComponent } from './extended-pdf-viewer/multiple-documents/multiple-documents.component';
import { HidingButtonsComponent } from './extended-pdf-viewer/hiding-buttons/hiding-buttons.component';
import { Base64Component } from './extended-pdf-viewer/base64/base64.component';
import { BlobComponent } from './extended-pdf-viewer/blob/blob.component';
import { SmartphoneComponent } from './extended-pdf-viewer/smartphone/smartphone.component';
import { ContextmenuComponent } from './extended-pdf-viewer/contextmenu/contextmenu.component';
import { CustomPrintDialogComponent } from './extended-pdf-viewer/custom-print-dialog/custom-print-dialog.component';
import { CustomToolbarComponent } from './extended-pdf-viewer/custom-toolbar/custom-toolbar.component';
import { DisplayOptionsComponent } from './extended-pdf-viewer/display-options/display-options.component';
import { CustomizationComponent } from './extended-pdf-viewer/customization/customization.component';
import { PerfectScrollbarComponent } from './extended-pdf-viewer/perfect-scrollbar/perfect-scrollbar.component';
import { LinksComponent } from './extended-pdf-viewer/links/links.component';
import { TextlayerComponent } from './extended-pdf-viewer/textlayer/textlayer.component';
import { TouchGesturesComponent } from './extended-pdf-viewer/touch-gestures/touch-gestures.component';
import { PrintRangeComponent } from './extended-pdf-viewer/print-range/print-range.component';
import { ChangelogComponent } from './extended-pdf-viewer/changelog/changelog.component';
import { PdfjsVersionsComponent } from './extended-pdf-viewer/pdfjs-versions/pdfjs-versions.component';
import { DefaultOptionsComponent } from './extended-pdf-viewer/default-options/default-options.component';
import { KeycloakComponent } from './extended-pdf-viewer/keycloak/keycloak.component';
import { CustomSidebarComponent } from './extended-pdf-viewer/custom-sidebar/custom-sidebar.component';
import { CustomThumbnailsComponent } from './extended-pdf-viewer/custom-thumbnails/custom-thumbnails.component';
import { FormsComponent } from './extended-pdf-viewer/forms/forms.component';
import { PageViewModeComponent } from './extended-pdf-viewer/page-view-mode/page-view-mode.component';
import { SignaturesComponent } from './extended-pdf-viewer/signatures/signatures.component';
import { InfiniteScrollComponent } from './extended-pdf-viewer/infinite-scroll/infinite-scroll.component';
import { PreloadGuard } from './extended-pdf-viewer/blob/preload.guard';
import { FileInfoComponent } from './extended-pdf-viewer/file-info/file-info.component';

const routes: Routes = [
  { path: 'alternatives', component: AlternativesComponent },
  { path: 'attributes', component: AttributesComponent },
  { path: 'base64', component: Base64Component },
  { path: 'blob', component: BlobComponent, canActivate: [PreloadGuard] },
  { path: 'contextmenu', component: ContextmenuComponent },
  { path: 'changelog', component: ChangelogComponent},
  { path: 'options', component: DefaultOptionsComponent},
  { path: 'customization', component: CustomizationComponent},
  { path: 'custom-toolbar', component: CustomToolbarComponent },
  { path: 'custom-sidebar', component: CustomSidebarComponent },
  { path: 'custom-thumbnails', component: CustomThumbnailsComponent },
  { path: 'display-options', component: DisplayOptionsComponent },
  { path: 'export', component: ExportComponent },
  { path: 'file-info', component: FileInfoComponent },
  { path: 'forms', component: FormsComponent },
  { path: 'layers', component: LayersComponent },
  { path: 'getting-started', component: GettingStartedComponent },
  { path: 'find', component: FindComponent },
  { path: 'i18n', component: I18nComponent },
  { path: 'infinite-scroll', component: InfiniteScrollComponent },
  { path: 'intro', component: IntroComponent },
  { path: 'hiding-buttons', component: HidingButtonsComponent },
  { path: 'links', component: LinksComponent },
  { path: 'keyboard', component: KeyboardComponent },
  { path: 'keycloak', component: KeycloakComponent },
  { path: 'mobile', component: MobileComponent },
  { path: 'multiple-documents', component: MultipleDocumentsComponent },
  { path: 'pages-loaded', component: PagesLoadedComponent },
  { path: 'pdfjs-versions', component: PdfjsVersionsComponent },
  { path: 'range-requests', component: RangeRequestsComponent },
  { path: 'signatures', component: SignaturesComponent},
  { path: 'simple', component: SimpleComponent },
  { path: 'smartphone', component: SmartphoneComponent },
  { path: 'textlayer', component: TextlayerComponent },
  { path: 'touch-gestures', component: TouchGesturesComponent },
  { path: 'troubleshooting', component: TroubleshootingComponent },
  { path: 'zoom', component: ZoomComponent },
  { path: 'custom-print-dialog', component: CustomPrintDialogComponent },
  { path: 'page-view-mode', component: PageViewModeComponent },
  { path: 'print-range', component: PrintRangeComponent },
  { path: 'perfect-scrollbar', component: PerfectScrollbarComponent },
  { path: '**', redirectTo: '/simple', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
