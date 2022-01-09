```typescript
@Component({
  selector: 'app-custom-background',
  templateUrl: './custom-background.component.html',
  styleUrls: ['./custom-background.component.css'],
})
export class CustomBackgroundComponent {
  public colorByPage(params: PdfBackgroundParameters): string | undefined {
    if (params?.pageNumber) {
      return params.pageNumber % 2 ? '#e8e1c4' : '#ffcb8a'
    }
    return undefined;
  }
}
```
