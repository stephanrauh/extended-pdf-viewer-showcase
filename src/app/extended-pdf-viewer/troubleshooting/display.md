# The viewer doesn't show, or looks wrong

## The viewer is empty or has no height

By default, the height of the viewer is 100%. On many web pages, that's 0 pixels. In this case, the viewer fills the space to the bottom of the window (at least 100 pixels), but it doesn't follow when the window is resized. Use `[height]` (e.g. `[height]="'90vh'"` or `[height]="'auto'"`) or `[minHeight]`. Don't forget the unit.

## The viewer is in a tab, a modal, or another hidden container

This used to be a common source of empty viewers. Since version 22.3.0, the viewer waits until it becomes visible before it initializes, so you don't need a `setTimeout()` anymore. Note that this means it never initializes if the user doesn't open the tab or the modal. Since version 27.5.0, the warning "offsetParent is not set" is gone, too: scroll requests sent while the viewer is hidden are replayed when it becomes visible again. The <a href="/extended-pdf-viewer/hidden-tabs">hidden tabs demo</a> shows both.

## Error messages when closing a modal

Many modal dialogs remove the HTML code before calling `ngOnDestroy()`. Call `ngOnDestroy()` of the viewer yourself before closing the modal. If you close the modal while the viewer is still rendering, you may see "worker destroyed" or "transport destroyed". These messages are harmless; you can hide them with a <a href="/extended-pdf-viewer/filtering-console-log">console filter</a>. See <a href="/extended-pdf-viewer/modal">the modal demo</a>.

## Several PDF viewers on the same page

You can only use one `<ngx-extended-pdf-viewer>` at a time, and that includes hidden viewers. If you try to open a second one, the console shows "You're trying to open two instances of the PDF viewer". To show several PDF files side by side, put each viewer into an iFrame, as shown in the <a href="/extended-pdf-viewer/side-by-side">side-by-side demo</a>.

## A Blob, a Base64 string, or a password-protected file doesn't open

- If a Blob doesn't open, convert it to a Base64 string and pass it to `[base64Src]`. The <a href="/extended-pdf-viewer/blob">Blob demo</a> has a helper function.
- Don't set both `[src]` and `[base64Src]`. It's unpredictable which one wins.
- `[password]` must be a string, even if the password consists of digits. A wrong password shows the error message "corrupt PDF file".

## Server-side rendering

Server-side rendering works without additional configuration. See <a href="/extended-pdf-viewer/server-side-rendering">server-side rendering</a>.

## Pages with huge images, or blurry pages

The viewer renders every page as a canvas, and browsers can't create arbitrarily large canvases. Small PDF files can contain images with a very high resolution, so this is sometimes hard to recognize.

ngx-extended-pdf-viewer limits the size of the canvas automatically: 32 megapixels on desktop browsers and 5 megapixels on mobile devices, plus additional optimizations on iOS. If a page exceeds the limit, it's rendered with a lower resolution. You can change the limit with `pdfDefaultOptions.maxCanvasPixels`, but raising it may crash the browser tab, especially on iOS. The resolution of the printout is set separately with `[printResolution]` (150 dpi by default).

## A button doesn't show

Most buttons are hidden on small screens. Set the attribute to `'always-visible'`, e.g. `[showFindButton]="'always-visible'"`. See <a href="/extended-pdf-viewer/responsive-design">responsive design</a>. If the find button is missing, see the tab "Find and select text".

## The PDF file appears above the toolbar when scrolling

This happens if you're using the `z-index` to position the `<ngx-extended-pdf-viewer>`. If you can't avoid that, add the global CSS rule `.body .toolbar { z-index: 0; }`. The viewer works without the `z-index` of the toolbar. The only difference is that the shadow of the toolbar is hidden by the PDF document.

## ExpressionChangedAfterItHasBeenCheckedError

If you use two-way binding for both `[(page)]` and `[(pageLabel)]`, you'll run into this error. Use the `OnPush` change detection strategy.

## Custom scrollbars

pdf.js builds its DOM asynchronously, so a custom scrollbar may not find the viewport. If you're using ngx-scrollbar, set its attribute `asyncViewport="auto"`. In any case, wait for `(pagesLoaded)`, not `(pdfLoaded)`: only then is `#viewerContainer` available. See <a href="/extended-pdf-viewer/perfect-scrollbar">perfect scrollbar</a>.
