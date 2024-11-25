import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { SharedModule } from './shared/shared.module';


@NgModule({
  imports: [
    BrowserAnimationsModule,
    provideClientHydration({ appId: 'serverApp' }),
    SharedModule,
    AppRoutingModule,
  ],
  providers: [
    { provide: 'APP_ID', useValue: 'serverApp' },
    // other providers
  ],
  exports: [
    BrowserAnimationsModule,
    BrowserModule,
    SharedModule,
    AppRoutingModule,
  ],
  bootstrap: [AppComponent]
})
export class AppCommonModule {}
