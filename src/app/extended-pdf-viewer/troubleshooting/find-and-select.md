# Find and select text

## There's no find button, or I can't select text

The PDF viewer uses two layers. The first layer is what you see; that's simply an image. The second layer is the text layer. You need it to select text, and without the text layer you can't find anything.

So you need two things:

1. **A PDF file that contains text.** A surprising number of PDF files are just scanned images. The viewer doesn't include an OCR reader, so there's nothing to find or select in such a file.
2. **An active text layer.** Rendering the text layer costs time, so it isn't always active. If you don't set `[textLayer]`, it depends on the cursor tool: on desktop browsers, the hand tool is active by default, and the text layer is only rendered if you also show the button to switch to the select tool. On iOS, the select tool is the default, so the text layer is active.

The simplest solution is to activate the text layer explicitly:

```html
<ngx-extended-pdf-viewer
  [src]="'/assets/pdfs/blind-text-collection.pdf'"
  [textLayer]="true"
  [showHandToolButton]="true">
</ngx-extended-pdf-viewer>
```

`[textLayer]="true"` activates the find button and lets you select text with the select tool. `[showHandToolButton]="true"` shows the buttons to switch between the select tool and the hand tool. If the find button is still missing, it may be hidden because the screen is small; see the tab "Display and layout".

If the console shows 'Hiding the "find" button because the text layer of the PDF file is not rendered', that's exactly this problem.

## Since version 31, I can't select text anymore

That's a breaking change in version 31.0.0-alpha.2 (<a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/3292">#3292</a>). Until then, `[textLayer]="false"` hid the find button, but rendered the text layer anyway, so your users could still select and copy text. Now `[textLayer]="false"` really switches the text layer off, and it hides the select tool button, too. Without a text layer, there's no text selection, no highlighting of selected text, no search hits marked on the page, and screen readers can't read the document. If you need any of these, remove the attribute or set it to `true`.

## When I select or find text, the selection is slightly off

The text layer is a good approximation of the real positions of the text, but it's not perfect. More often than not, the selection is half a character off, sometimes even more. There's nothing you can do about it, except offering your help to the base project, <a target="_blank" href="https://github.com/mozilla/pdf.js">pdf.js</a>. It supports almost every language and every font of the world, so it's hard to get it right.
