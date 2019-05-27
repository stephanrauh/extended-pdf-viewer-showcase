import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CodeComponent } from '../code/code.component';
import { PagesLoadedComponent } from './pages-loaded.component';
import { SharedModule } from '../shared.module';
import { MatCardModule } from '@angular/material';

@NgModule({
  declarations: [PagesLoadedComponent],
  imports: [CommonModule, NgxExtendedPdfViewerModule, SharedModule]
})
export class PagesLoadedModule {}
