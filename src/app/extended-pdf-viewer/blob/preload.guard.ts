import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { BlobService } from './blob.service';

@Injectable({providedIn: 'root'})
export class PreloadGuard implements CanActivate {
  constructor(private http: HttpClient, private blobService: BlobService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.http
      .get('/assets/pdfs/pdf-sample.pdf', { responseType: 'blob' })
      .pipe(
        tap((blob) => (this.blobService.src = blob)),
        map(() => true)
      );
  }
}
