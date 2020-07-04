```typescript
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
@Component({ ... })
export class DefaultOptionsComponent {
  constructor() {
    pdfDefaultOptions.assetsFolder = 'bleeding-edge';
  }
}
```
