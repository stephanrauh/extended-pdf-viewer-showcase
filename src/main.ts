
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { provideClientHydration, bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxExtendedPdfViewerModule, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { HttpClient, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing.module';
import { TouchEmulator } from './app/touch-emulator';
import { isLocalhost } from './app/extended-pdf-viewer/common/utilities';

// Initialize TouchEmulator and configure pdfDefaultOptions
new TouchEmulator();
pdfDefaultOptions._internalFilenameSuffix = isLocalhost()? '' : '.min';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi(), withFetch()),
        importProvidersFrom(
            BrowserAnimationsModule, 
            NgxExtendedPdfViewerModule,
            MarkdownModule.forRoot({ loader: HttpClient })
        ),
        provideClientHydration()
    ]
})
  .catch(err => console.error(err));
