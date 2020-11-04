import { LayersComponent } from './layers/layers.component';
import { ExportComponent } from './export/export.component';
import { KeyboardComponent } from './keyboard/keyboard.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { I18nComponent } from './i18n/i18n.component';
import { PagesLoadedComponent } from './pages-loaded/pages-loaded.component';
import { SimpleComponent } from './simple/simple.component';
import { TroubleshootingComponent } from './troubleshooting/troubleshooting.component';
import { MobileComponent } from './mobile/mobile.component';
import { ZoomComponent } from './zoom/zoom.component';
import { AttributesComponent } from './attributes/attributes.component';
import { IntroComponent } from './intro/intro.component';
import { AlternativesComponent } from './alternatives/alternatives.component';
import { RangeRequestsComponent } from './range-requests/range-requests.component';
import { FindComponent } from './find/find.component';
import { MultipleDocumentsComponent } from './multiple-documents/multiple-documents.component';
import { HidingButtonsComponent } from './hiding-buttons/hiding-buttons.component';
import { Base64Component } from './base64/base64.component';
import { BlobComponent } from './blob/blob.component';
import { SmartphoneComponent } from './smartphone/smartphone.component';
import { ContextmenuComponent } from './contextmenu/contextmenu.component';
import { CustomPrintDialogComponent } from './custom-print-dialog/custom-print-dialog.component';
import { CustomToolbarComponent } from './custom-toolbar/custom-toolbar.component';
import { DisplayOptionsComponent } from './display-options/display-options.component';
import { CustomizationComponent } from './customization/customization.component';
import { PerfectScrollbarComponent } from './perfect-scrollbar/perfect-scrollbar.component';
import { LinksComponent } from './links/links.component';
import { TextlayerComponent } from './textlayer/textlayer.component';
import { TouchGesturesComponent } from './touch-gestures/touch-gestures.component';
import { PrintRangeComponent } from './print-range/print-range.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { PdfjsVersionsComponent } from './pdfjs-versions/pdfjs-versions.component';
import { DefaultOptionsComponent } from './default-options/default-options.component';
import { KeycloakComponent } from './keycloak/keycloak.component';
import { CustomSidebarComponent } from './custom-sidebar/custom-sidebar.component';
import { CustomThumbnailsComponent } from './custom-thumbnails/custom-thumbnails.component';
import { FormsComponent } from './forms/forms.component';
import { PageViewModeComponent } from './page-view-mode/page-view-mode.component';
import { SignaturesComponent } from './signatures/signatures.component';

const routes: Routes = [
  { path: 'alternatives', component: AlternativesComponent },
  { path: 'attributes', component: AttributesComponent },
  { path: 'base64', component: Base64Component },
  { path: 'blob', component: BlobComponent },
  { path: 'contextmenu', component: ContextmenuComponent },
  { path: 'changelog', component: ChangelogComponent},
  { path: 'options', component: DefaultOptionsComponent},
  { path: 'customization', component: CustomizationComponent},
  { path: 'custom-toolbar', component: CustomToolbarComponent },
  { path: 'custom-sidebar', component: CustomSidebarComponent },
  { path: 'custom-thumbnails', component: CustomThumbnailsComponent },
  { path: 'display-options', component: DisplayOptionsComponent },
  { path: 'export', component: ExportComponent },
  { path: 'forms', component: FormsComponent },
  { path: 'layers', component: LayersComponent },
  { path: 'getting-started', component: GettingStartedComponent },
  { path: 'find', component: FindComponent },
  { path: 'i18n', component: I18nComponent },
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
