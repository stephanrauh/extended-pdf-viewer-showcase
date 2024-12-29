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
  queueMicrotask(() => {
    console.log(change.clientX);
    console.log(change.clientY);
  });
});
```
