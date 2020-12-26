```typescript
export let pdfDefaultOptions = {
  externalLinkTarget: 0,
  renderer: 'canvas',
  assetsFolder: 'assets',
  workerSrc: () => _isIE11 || isEdge ? './' + pdfDefaultOptions.assetsFolder + '/pdf.worker-es5.js' : './' + pdfDefaultOptions.assetsFolder + '/pdf.worker.js',
};
```
