```typescript
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
@Component({ ... })
export class MobileComponent {
  public enablePinchOnMobile = true;

  public zoomLevels = ['auto', 'page-actual', 'page-fit', 'page-width',
                       0.5, 0.67, 0.75, 0.82, 0.9, 1, 1.1, 1.15, 
                       1.25, 1.5];
  
  constructor() {
    pdfDefaultOptions.doubleTapZoomFactor = "125%";
  }                       
}

```
