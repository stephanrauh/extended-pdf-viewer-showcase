import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DefaultRoutesComponent } from './shared/default-routes/default-routes.component';

const routes: Routes = [
  {
    path: 'extended-pdf-viewer',
    loadChildren: () => import('./extended-pdf-viewer/extended-pdf-viewer.module').then(m => m.ExtendedPdfViewerModule)
  },
  { path: ':path', component: DefaultRoutesComponent },
  { path: '**', redirectTo: '/extended-pdf-viewer/simple', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
