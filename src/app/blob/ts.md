```typescript
@Component({ ... })
export class BlobComponent {
  public src: Blob;

  constructor(private http: HttpClient, private blobService: BlobService) {
    this.usePreloadedFile();
  }

  public usePreloadedFile(): void {
    this.src = this.blobService.src;
  }

  public loadLargeFile(): void {
    this.http
      .get(
        '/assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf',
        { responseType: 'blob' }
      )
      .subscribe((res) => this.src = res);
  }
}
```
