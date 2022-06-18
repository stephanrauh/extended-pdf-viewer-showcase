import { AlternativesComponent } from './alternatives/alternatives.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LayoutModule } from '@angular/cdk/layout';
import { MarkdownModule } from 'ngx-markdown';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { NgModule } from '@angular/core';
import { Ie11MarkdownComponent } from './ie11-markdown/ie11-markdown.component';
import { DefaultRoutesComponent } from './default-routes/default-routes.component';
import { CommonModule } from '@angular/common';
import { Angular2SmartTableModule } from 'angular2-smart-table';
import { CopyrightBoxComponent } from './copyright-box/copyright-box.component';

@NgModule({
  declarations: [
    Ie11MarkdownComponent,
    DefaultRoutesComponent,
    AlternativesComponent,
    CopyrightBoxComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    HttpClientModule,
    LayoutModule,
    MarkdownModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTooltipModule,
    MatToolbarModule,
    MatTreeModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
    Angular2SmartTableModule
  ],
  exports: [
    CommonModule,
    AlternativesComponent,
    Ie11MarkdownComponent,
    FormsModule,
    FlexLayoutModule,
    HttpClientModule,
    LayoutModule,
    MarkdownModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTooltipModule,
    MatToolbarModule,
    MatTreeModule,
    Angular2SmartTableModule,
    CopyrightBoxComponent
  ],
})
export class SharedModule {}
