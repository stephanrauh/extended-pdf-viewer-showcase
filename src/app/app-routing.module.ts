import { NgModule, SimpleChanges } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { I18nComponent } from './i18n/i18n.component';
import { PagesLoadedComponent } from './pages-loaded/pages-loaded.component';
import { SimpleComponent } from './simple/simple.component';
import { TroubleshootingComponent } from './troubleshooting/troubleshooting.component';
import { MobileComponent } from './mobile/mobile.component';
import { ZoomComponent } from './zoom/zoom.component';

const routes: Routes = [
  { path: 'getting-started', component: GettingStartedComponent },
  { path: 'i18n', component: I18nComponent },
  { path: 'mobile', component: MobileComponent },
  { path: 'pages-loaded', component: PagesLoadedComponent },
  { path: 'simple', component: SimpleComponent },
  { path: 'troubleshooting', component: TroubleshootingComponent },
  { path: 'zoom', component: ZoomComponent },
  { path: '**', redirectTo: '/simple', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
