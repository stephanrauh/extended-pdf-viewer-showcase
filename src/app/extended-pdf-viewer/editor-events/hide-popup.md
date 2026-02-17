```html
<ngx-extended-pdf-viewer
  [src]="'/assets/pdfs/ngx-extended-pdf-viewer-flyer.pdf'"
  [height]="'90vh'"
  [textLayer]="true"
  (annotationEditorEvent)="onEditorEvent($event)"
>
</ngx-extended-pdf-viewer>
```

```typescript
import { Component } from '@angular/core';
import { AnnotationEditorEvent } from 'ngx-extended-pdf-viewer';

@Component({ ... })
export class EditorEventsComponent {

  public onEditorEvent(event: AnnotationEditorEvent): void {
    if (event.type === 'drawingStarted') {
      // Hide all editor option popups while the user is drawing
      const popups = document.querySelectorAll('.editorParamsToolbar');
      popups.forEach(el => el.classList.add('hidden'));
    } else if (event.type === 'drawingStopped') {
      // Show the currently active editor's popup again
      const popups = document.querySelectorAll('.editorParamsToolbar');
      popups.forEach(el => el.classList.remove('hidden'));
    }
  }
}
```
