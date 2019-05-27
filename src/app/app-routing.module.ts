import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SimpleComponent } from './simple/simple.component';
import { PagesLoadedComponent } from './pages-loaded/pages-loaded.component';

const routes: Routes = [
  { path: 'simple', component: SimpleComponent },
  { path: 'pages-loaded', component: PagesLoadedComponent },
  { path: '**', redirectTo: '/simple', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
