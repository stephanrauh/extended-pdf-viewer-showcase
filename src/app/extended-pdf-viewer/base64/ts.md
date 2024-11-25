```typescript
@Component({
standalone: false,  ... })
export class Base64Component{
export class Base64Component {
  public base64 = new Subject<string>();

  constructor(private httpClient: HttpClient) {}

  public ngOnInit(): void {
    this.httpClient.get(
        '/assets/pdfs/Bootstrap-vs-Material-Design-vs-Prime-vs-Tailwind.base64.txt',
        { responseType: 'text' as 'json' })
      .pipe(
        tap((base64) => (this.base64. = base64 as string)),
      ).subscribe();
  }
}
```
