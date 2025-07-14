```typescript
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
standalone: false,  ... })
export class ModifyingPageOrderComponent {

  constructor() {
    pdfDefaultOptions.enablePageReordering = true;
  }
}
```
