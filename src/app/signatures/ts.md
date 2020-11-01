```typescript
 @Component({
  selector: 'app-simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.css']
})
export class SignatureComponent {
  constructor() {
    pdfDefaultOptions.renderInteractiveForms = false;
  }
}
```
