
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

// Register a default Trusted Types policy so libraries that assign innerHTML
// without their own policy (ngx-markdown / marked / Prism) keep working under
// `require-trusted-types-for 'script'`. In a real app, route this through
// DOMPurify; the showcase only renders content it ships itself.
if (typeof window !== 'undefined' && (window as any).trustedTypes?.createPolicy) {
  try {
    (window as any).trustedTypes.createPolicy('default', {
      createHTML: (s: string) => s,
      createScriptURL: (s: string) => s,
      createScript: (s: string) => s,
    });
  } catch {
    // policy already registered (HMR / second bootstrap) — ignore
  }
}

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
