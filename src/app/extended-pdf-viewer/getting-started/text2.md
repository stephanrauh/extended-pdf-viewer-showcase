

## What if I'm getting my PDF file from a REST resource?

That's no problem. If you want to display a PDF file from a server, you probably have a `Blob` instead of an URL. Since version 0.9.21, you can pass this Blob directly to the `src` attribute. It supports Blobs, Uint8Arrays, and ArrayBuffers.

If your PDF file is a base64 encoded string, use the attribute `[base64Src]` instead. It decodes the base64 string and displays it as a regular PDF file.
