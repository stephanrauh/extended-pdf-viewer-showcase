import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nComponent } from './i18n.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SharedModule } from '../shared.module';

@NgModule({
  declarations: [I18nComponent],
  imports: [CommonModule, NgxExtendedPdfViewerModule, SharedModule]
})
export class I18nModule {}
