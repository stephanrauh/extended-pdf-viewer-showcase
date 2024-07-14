```ts
constructor(notificationService: PDFNotificationService) {
  effect(() => {
    this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
  });
}
...
this.PDFViewerApplication.eventBus.on(
      'fileinputchange', 
      (change: FileInputChanged) => {
  this.ngZone.run(() => {
    console.log(change.clientX);
    console.log(change.clientY);
  });
});
```
