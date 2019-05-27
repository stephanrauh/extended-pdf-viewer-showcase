import { NgModule } from '@angular/core';
import { CodeComponent } from './code/code.component';
import { MatTabsModule, MatCardModule } from '@angular/material';

@NgModule({
  declarations: [CodeComponent],
  imports: [MatTabsModule, MatCardModule],
  exports: [CodeComponent, MatCardModule, MatTabsModule]
})
export class SharedModule {}
