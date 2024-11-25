```typescript
@Component({
standalone: false,  ... })
export class CustomBreakpointsComponent {
  constructor() {
    // these are the default values
    PdfBreakpoints.xs = 490; // unit: pixels
    PdfBreakpoints.sm = 560;
    PdfBreakpoints.md = 610;
    PdfBreakpoints.lg = 660;
    PdfBreakpoints.xl = 740;
    PdfBreakpoints.xxl = 830;
  }
}
```
