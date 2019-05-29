import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SimpleComponent } from './simple/simple.component';
import { PagesLoadedComponent } from './pages-loaded/pages-loaded.component';
import { I18nComponent } from './i18n/i18n.component';

const routes: Routes = [
  { path: 'i18n', component: I18nComponent },
  { path: 'simple', component: SimpleComponent },
  { path: 'pages-loaded', component: PagesLoadedComponent },
  { path: '**', redirectTo: '/simple', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
