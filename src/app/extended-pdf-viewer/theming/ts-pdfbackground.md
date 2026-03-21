```typescript
export class ThemingComponent {
  // Change this value at any time to update the PDF page background
  pdfBackgroundColor = '';

  setDarkMode(enabled: boolean) {
    this.pdfBackgroundColor = enabled ? '#1a1a2e' : '';
  }
}
```
