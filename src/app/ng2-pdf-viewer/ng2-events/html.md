```html
<pdf-viewer [src]="'/assets/pdfs/GraalVM Dictionary Bytecode, Interpreters, C1 Compiler, C2 Compiler, CPUs, and More.pdf'"
            [render-text]="true"
            [show-all]="true"
            (after-load-complete)="onEvent('after-load-complete', $event)"
            (page-rendered)="onEvent('page-rendered', $event)"
            (text-layer-rendered)="onEvent('text-layer-rendered', $event)"
            (on-progress)="onEvent('on-progres', $event)"
            (pageChange)="onEvent('pageChange', $event)"
            (error)="onError($event)"
            style="width: 100%; height: 100%"
            >
</pdf-viewer>
```
