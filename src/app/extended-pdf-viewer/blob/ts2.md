```typescript
@Injectable({providedIn: 'root'})
export class BlobService {
  public src: Blob;
}

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

```
