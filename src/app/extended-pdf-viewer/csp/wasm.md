```ts
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

// Set this before the first <ngx-extended-pdf-viewer> initializes
// (typically in main.ts or your app's bootstrap code).
pdfDefaultOptions.useWasm = false;
```
