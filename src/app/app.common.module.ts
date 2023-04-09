import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from './shared/shared.module';
import { WindowRefService } from './window-ref.servce';


@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    SharedModule,
    AppRoutingModule,
  ],
  exports: [
    BrowserAnimationsModule,
    BrowserModule,
    SharedModule,
    AppRoutingModule,
  ],
  providers: [WindowRefService],
  bootstrap: [AppComponent]
})
export class AppCommonModule {}
