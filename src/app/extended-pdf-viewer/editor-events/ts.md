```typescript
import { Component } from '@angular/core';
import { AnnotationEditorEvent } from 'ngx-extended-pdf-viewer';

@Component({ ... })
export class EditorEventsComponent {
  public messages: string[] = [];

  public onEvent(type: string, event: AnnotationEditorEvent): void {
    const now = new Date().toLocaleTimeString();
    let e = '(no parameters)';
    if (event) {
      if (event.source) {
        event.source = undefined;
      }
      try {
        e = 'Event type: ' + event.type + ' Event: '
          + JSON.stringify(event).substring(0, 60);
      } catch {
        e = 'Event type: ' + event.type + ' Event: ' + event;
      }
    }
    this.messages.push(`${now} ${type} ${e}`);
  }
}
```
