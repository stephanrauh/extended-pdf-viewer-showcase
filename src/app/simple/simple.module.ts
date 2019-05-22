import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleComponent } from './simple.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CodeComponent } from '../code/code.component';

@NgModule({
  declarations: [SimpleComponent, CodeComponent],
  imports: [CommonModule, NgxExtendedPdfViewerModule]
})
export class SimpleModule {}
