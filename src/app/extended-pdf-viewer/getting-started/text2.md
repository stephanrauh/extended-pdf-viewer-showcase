## Almost there!

Add `NgxExtendedPdfViewerModule` to the import section of your module file. If your IDE doesn't find
    the import automatically, here it is:

```typescript
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
```

Now you can display the PDF file like so:

```html
<ngx-extended-pdf-viewer [src]="'assets/example.pdf'" [useBrowserLocale]="true"></ngx-extended-pdf-viewer>
```

_Hint:_ If you are using JHipster, note there's no `assets` folder, so most likely the path of the URL is something like `[src]="'content/example.pdf'"`.

## What if I'm getting my PDF file from a REST resource?

That's no problem. If you want to display a PDF file from a server, you probably have a `Blob` instead of an URL. Since version 0.9.21, you can pass this Blob directly to the `src` attribute. It supports Blobs, Uint8Arrays, and ArrayBuffers.

If your PDF file is a base64 encoded string, use the attribute `[base64Src]` instead. It decodes the base64 string and displays it as a regular PDF file.
