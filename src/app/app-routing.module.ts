import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DefaultRoutesComponent } from './shared/default-routes/default-routes.component';
import { GettingStartedComponent } from './nav/getting-started/getting-started.component';

const routes: Routes = [
  { path: '', redirectTo: '/extended-pdf-viewer/simple', pathMatch: 'full' },
  { path: 'extended-pdf-viewer/getting-started', component: GettingStartedComponent },
  {
    path: 'extended-pdf-viewer',
    loadChildren: () => import('./extended-pdf-viewer/extended-pdf-viewer.module').then(m => m.ExtendedPdfViewerModule)
  },
  { path: ':path', component: DefaultRoutesComponent },
  { path: '**', redirectTo: '/extended-pdf-viewer/simple', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking'
})],
  exports: [RouterModule]
})
export class AppRoutingModule {}
