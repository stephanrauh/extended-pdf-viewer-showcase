```typescript
public exportAnnotations(): void {
  this.selectedTabIndex = 4;
  this.rawAnnotations = this.pdfViewerService.getSerializedAnnotations();
}
```
The `rawAnnotations` are what you see in the "live demo" tab.
