```html
<div fxLayout="row" fxLayoutAlign="space-between" *ngIf="!fullscreen">
  <div fxFlex="48%" class="scrollbar">
    <pdf-viewer [src]="'/assets/pdfs/GraalVM Dictionary Bytecode, Interpreters, C1 Compiler, C2 Compiler, CPUs, and More.pdf'"
      [render-text]="renderText"
      [show-all]="true"
      [zoom]="0.85">
    </pdf-viewer>
  </div>
  <div fxFlex="48%" class="scrollbar">
    <pdf-viewer [src]="'/assets/pdfs/What About GraalVM.pdf'"
      [render-text]="renderText"
      [show-all]="true"
      [zoom]="0.85">
    </pdf-viewer>
  </div>
</div>
```
