```typescript

import { HttpClient } from '@angular/common/http';
import { Component, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface PdfState {
  status: 'idle' | 'loading' | 'loaded' | 'loaded and rendered' | 'error';
  isRendering: boolean;
  error?: string;
}
@Component({
  standalone: false,
  selector: 'app-signatures',
  templateUrl: './loading-indicator.component.html',
  styleUrls: ['./loading-indicator.component.css'],
})
export class LoadingIndicatorComponent {

  private http = inject(HttpClient);

  public src: Blob | undefined = undefined;

  private pdfState = signal<PdfState>({
    status: 'idle',
    isRendering: false
  });

  // Computed signals
  isLoading = computed(() => this.pdfState().status === 'loading');
  isPdfLoaded = computed(() => this.pdfState().status === 'loaded');
  isRendering = computed(() => this.pdfState().isRendering);
  hasError = computed(() => this.pdfState().status === 'error');

  constructor() {
    this.loadLargeFile();
  }

  showLoadingIndicator = computed(() =>
    this.isLoading() || (this.isPdfLoaded() && this.isRendering())
  );

  loadingMessage = computed(() => {
    const state = this.pdfState();
    if (state.status === 'loading') return 'Loading the PDF...';
    if (state.isRendering) return 'Rendering...';
    if (state.status === 'error') return `Error: ${state.error || 'Unknown error'}`;
    return '';
  });

  // Event handlers with state updates
  onPdfLoading() {
    this.pdfState.update(state => ({
      ...state,
      status: 'loading',
      isRendering: false,
      error: undefined
    }));
  }

  onPdfLoaded() {
    this.pdfState.update(state => ({
      ...state,
      status: 'loaded',
      isRendering: false
    }));
  }

  onPdfLoadingFailed(error?: string) {
    this.pdfState.update(state => ({
      ...state,
      status: 'error',
      isRendering: false,
      error
    }));
  }

  onPageRender() {
    this.pdfState.update(state => {
      if (state.status === 'loaded') {
        return { ...state, isRendering: true };
      }
      return state;
    });
  }

  onPageRendered() {
    this.pdfState.update(state => {
      if (state.status === 'loaded') {
        return { ...state,
          status: 'loaded and rendered',
          isRendering: false };
      }
      return state;
    });
  }

  public loadLargeFile(): void {
    this.src = undefined;
    setTimeout(async () => await this.loadPdfWithDelay());
  }

  private async loadPdfWithDelay() {
    this.onPdfLoading();
    await this.sleep(2000);

    try {
      const blob = await firstValueFrom(this.http.get(
        '/assets/pdfs/slow-rendering.pdf',
        { responseType: 'blob' }));

      this.src = blob;
    } catch {
      this.onPdfLoadingFailed("Couldn't load the PDF file");
      this.src = undefined;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

```
