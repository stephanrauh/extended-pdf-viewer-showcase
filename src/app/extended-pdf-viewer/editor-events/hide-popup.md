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

  private toolbarMap: Record<string, string> = {
    InkEditor: 'editorInkParamsToolbar',
    HighlightEditor: 'editorHighlightParamsToolbar',
  };

  public onEditorEvent(event: AnnotationEditorEvent): void {
    const toolbarId = this.toolbarMap[event.editorType];
    if (!toolbarId) return;

    const toolbar = document.getElementById(toolbarId);
    if (!toolbar) return;

    if (event.type === 'drawingStarted') {
      toolbar.classList.add('hidden');
    }
    if (event.type === 'drawingStopped') {
      toolbar.classList.remove('hidden');
    }
  }
}
```
