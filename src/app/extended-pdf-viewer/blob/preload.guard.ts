import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { BlobService } from './blob.service';

export const preloadGuard = () => {
  const http = inject(HttpClient);
  const blobService = inject(BlobService);
  return http
    .get('/assets/pdfs/pdf-sample.pdf', { responseType: 'blob' })
    .pipe(
      tap((blob) => (blobService.src = blob)),
      map(() => true)
    );
}

