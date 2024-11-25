```typescript
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
@Component({
standalone: false,  ... })
export class DefaultOptionsComponent {
  constructor() {
    pdfDefaultOptions.assetsFolder = 'bleeding-edge';
  }
}
```
