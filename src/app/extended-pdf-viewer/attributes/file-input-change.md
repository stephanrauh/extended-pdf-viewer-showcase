```ts
const PDFViewerApplication: IPDFViewerApplication = 
      (window as any).PDFViewerApplication;
PDFViewerApplication.eventBus.on(
      'fileinputchange', 
      (change: FileInputChanged) => {
  this.ngZone.run(() => {
    console.log(change.clientX);
    console.log(change.clientY);
  });
});
```
