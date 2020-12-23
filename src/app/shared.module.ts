import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { FormsModule } from '@angular/forms';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { Ie11MarkdownComponent } from './ie11-markdown/ie11-markdown.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { BrowserModule } from '@angular/platform-browser';


@NgModule({
  declarations: [
    Ie11MarkdownComponent,
  ],
  imports: [
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    LayoutModule,
    FlexLayoutModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatRadioModule,
    MatTabsModule,
    MatTreeModule,
    MatTooltipModule,
    MatProgressBarModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
    PerfectScrollbarModule,
    NgxExtendedPdfViewerModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    LayoutModule,

  ],
  exports: [
    NgxExtendedPdfViewerModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    LayoutModule,
    FlexLayoutModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatRadioModule,
    MatTabsModule,
    MatTreeModule,
    MatTooltipModule,
    MatProgressBarModule,
    MarkdownModule,
    PerfectScrollbarModule,
    Ie11MarkdownComponent,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    LayoutModule,
  ],
  providers: [],
})
export class SharedModule {}
