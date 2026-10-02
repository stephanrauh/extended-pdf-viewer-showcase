# Printing

## How printing works, and why your CSS matters

The PDF viewer doesn't really print anything. It hides the entire page using CSS and adds high-resolution images of the PDF pages to the HTML document. After that, it calls the print function of your browser. Basically, it's printing the entire HTML page, including your Angular application. If everything works as intended, you don't notice because your Angular application is hidden.

However, your custom CSS is still active. For example, if it reduces the font size, you end up with scaled-down pages in print. That's why problems with printing are almost always problems of the CSS code. That doesn't necessarily mean you've done anything wrong: the core library is the PDF viewer of Firefox, so it assumes there's no CSS framework at all.

ngx-extended-pdf-viewer covers several popular CSS frameworks (such as Bootstrap and Material Design), but there may be a conflict I haven't seen yet. If so, checking the `display` and `overflow` properties is a good starting point. Often adding this CSS snippet solves the problem:

```css
@media print {
  #printContainer > div {
    display: inline;
    overflow-y: visible;
  }
}
```

## Empty pages when printing

Often adding these CSS rules to your global `styles.scss` helps:

```css
@media print {
  #printContainer > .printedPage {
    width: 99%;
  }
}
```

## The printout includes parts of my application

Usually, the entire screen is hidden automatically, but sometimes this fails, especially with widgets that are added dynamically, such as error messages, progress bars, and block UI overlays. Use a media query to hide them, e.g. `@media print { #modal-error-dialog { display: none; } }`.

## CTRL+P prints the PDF file instead of my page

That's the attribute `[replaceBrowserPrint]`. It's active by default since version 16.0.0. Set `[replaceBrowserPrint]="false"` if CTRL+P and the print menu of the browser should print the web page. See <a href="/extended-pdf-viewer/print-range">print range</a>.

## The printout is blurry

The resolution of the printout is defined by `[printResolution]`. The default is 150 dpi. Higher values make the printout sharper, but print preparation takes longer and needs more memory.

## Hunting down other printing issues

You can debug print issues yourself. I've written detailed instructions in <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/1431#issuecomment-1162091452">issue #1431</a>. When you start debugging, you'll probably want to compare the CSS rules of your project with a reference project. Either create a fresh project with the schematics (see <a href="/extended-pdf-viewer/getting-started">getting started</a>), or use the <a href="https://mozilla.github.io/pdf.js/web/viewer.html">showcase of Mozilla's project</a>.

These older issues also contain useful hints: <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/143">#143</a>, <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/148">#148</a>, <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/175">#175</a>, and <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/48#issuecomment-596629621">#48</a> (Bootstrap scaling the printout down).
