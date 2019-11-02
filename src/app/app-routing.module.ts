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
import { ResponsiveDesignComponent } from './responsive-design/responsive-design.component';
import { SmartphoneComponent } from './smartphone/smartphone.component';
import { ContextmenuComponent } from './contextmenu/contextmenu.component';
import { CustomPrintDialogComponent } from './custom-print-dialog/custom-print-dialog.component';

const routes: Routes = [
  { path: 'alternatives', component: AlternativesComponent },
  { path: 'attributes', component: AttributesComponent },
  { path: 'base64', component: Base64Component },
  { path: 'contextmenu', component: ContextmenuComponent },
  { path: 'getting-started', component: GettingStartedComponent },
  { path: 'find', component: FindComponent },
  { path: 'i18n', component: I18nComponent },
  { path: 'intro', component: IntroComponent },
  { path: 'hiding-buttons', component: HidingButtonsComponent },
  { path: 'keyboard', component: KeyboardComponent },
  { path: 'mobile', component: MobileComponent },
  { path: 'multiple-documents', component: MultipleDocumentsComponent },
  { path: 'pages-loaded', component: PagesLoadedComponent },
  { path: 'range-requests', component: RangeRequestsComponent },
  { path: 'responsive-design', component: ResponsiveDesignComponent },
  { path: 'simple', component: SimpleComponent },
  { path: 'smartphone', component: SmartphoneComponent },
  { path: 'troubleshooting', component: TroubleshootingComponent },
  { path: 'zoom', component: ZoomComponent },
  { path: 'custom-print-dialog', component: CustomPrintDialogComponent },
  { path: '**', redirectTo: '/simple', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
