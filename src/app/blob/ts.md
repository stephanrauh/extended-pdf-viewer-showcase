```typescript
@Component({ ... })
export class BlobComponent{
  public blob: Blob;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get('/assets/pdfs/FILE.pdf', { responseType: 'blob' })
      .subscribe(res => {
        this.blob = res;
      });
  }
}
```
