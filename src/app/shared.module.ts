import { NgModule } from '@angular/core';
import { CodeComponent } from './code/code.component';
import { MatTabsModule, MatCardModule, MatFormFieldModule, MatSelectModule } from '@angular/material';

@NgModule({
  declarations: [CodeComponent],
  imports: [MatCardModule, MatFormFieldModule, MatSelectModule, MatTabsModule],
  exports: [CodeComponent, MatCardModule, MatFormFieldModule, MatSelectModule, MatTabsModule]
})
export class SharedModule {}
