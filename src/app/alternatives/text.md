# Alternatives to ngx-extended-pdf-viewer

There's a similar copy of this text at <a target="#" href="https://www.beyondjava.net/ngx-extended-pdf-viewer">beyondjava.net</a>.

## Using the native browser support

In a way, it's crazy to use a library to display PDF files in a browser. Every modern browser can show PDF files natively. Just drag and drop a PDF file into the browser, and you'll see a PDF viewer that's every bit as powerful as Adobe's native PDF viewer.

Only - well, there are some outdated versions of our good old friend called Internet Explorer out there. Plus, many other browsers don't support PDF files. Sometimes it's not enough to focus on the evergreen browsers. Adding insult to injury, there's no standardized way to embed a PDF file on a web page, and the public API is limited. What you can do is using the `<object>` tag like so:

```html
<object data="https://example.com/test.pdf#page=2" type="application/pdf" width="100%" height="100%">
  <p>Your browser does not support PDFs. <a href="https://example.com/test.pdf">Download the PDF</a>.</p>
</object>
```

Philipp Spiess has an <a target="#" href="https://pspdfkit.com/blog/2018/open-pdf-in-your-web-app/">exhaustive roundup of this approach</a>. Highly recommended. Be warned: Along the way, he's trying to sell you a professional PDF tool which may or may not be useful. I wouldn't know because both BeyondJava.net and pdfviewer.net are very serious about never doing advertising. So I didn't even evaluate it.

## Enter pdf.js

Every other solution (well, as far as I know) is based on <a href="https://mozilla.github.io/pdf.js/">an open-source PDF viewer called pdf.js</a>. It's written in JavaScript, so it's easy to use the library in your own project. It's also the PDF viewer used by Firefox and Google Chrome. In other words: it's battle-proven and rock-solid.

Several tutorials are telling you how easy it is to use pdf.js. For example, the author I've already quoted, Philipp Spiess, <a href="https://pspdfkit.com/blog/2018/render-pdfs-in-the-browser-with-pdf-js/">has written a nice walkthrough</a>.

The catch is it's easy as long as you're happy with just displaying the PDF file without any bells and whistles. As soon as you want to add more features - such as scaling, searching, rotating, printing - complexity quickly gets through the roof. Most tutorials solve the problem by embedding Mozilla's web viewer in an iFrame. The good news is that this approach works. Nonetheless, in many projects, that's a no-go. iFrames went out of fashion for a reason.

What we're looking for is a simple but powerful solution.

## https://www.npmjs.com/package/ng2-pdfjs-viewer

Did I say nobody's using iFrames in 2019? A developer nicknamed Code Hippie does. As things go, they implemented their PDF viewer almost at the same time as I did. Their approach is very simple: create an Angular component wrapping the PDF viewer in an iFrame. You can send parameters to the PDF viewer using the URL. That's quite a few parameters, so chances are you're happy with this approach.

The iFrame approach is simple and robust. If you're not happy with ngx-extended-pdf-viewer, go for the library of Codehippie. You'll lose some options - but most likely you don't need them anyways.

## ng2-pdf-viewer: Displaying PDF files in a no-nonsense way

This library is the way to go if you just want to render PDF files and nothing else. No toolbar, no thumbnails, just the plain PDF file. <a href="https://www.npmjs.com/package/ng2-pdf-viewer">ng2-pdf-viewer</a> gives you a decent API, is actively maintained, and is popular enough to feel trustworthy. At the time of writing, it saw more than 99.000 downloads a month. Without having used the library myself, I suppose Vadym Yatsyuk is doing a great job with his library.

## ng2-image-viewer

This nice library is an image viewer at it's heart. The author, Breno Prata, took the <a target="#" href="http://ignitersworld.com/lab/imageViewer.html">ImageViewer</a> library, wrapped in a carousel, and added PDF support to it.

As far as I can see, ng2-image-viewer relies on the browser to render the PDF file natively. Don't hope for Internet Explorer support. Plus, the PDF viewer is always shown completely, without options to customize it. Other than that, it's a nice little library if you need to display the PDF file in a carousel.

Have a look at the <a href="https://brenoprata10.github.io/ng2-image-viewer/">showcase</a> or get the downloads coordinates from the <a href="https://www.npmjs.com/package/ng2-image-viewer" target="#">npm page</a>.

## Angular.js 1.x

Are you still using AngularJS 1.x? Then you should check out <a href="https://github.com/legalthings/angular-pdfjs-viewer">angular-pdfjs-viewer</a> is a fine library. Unfortunately, the authors ceased to maintain it, so use it at your own risk.

## ngx-extended-pdf-viewer

How does ngx-extended-pdf-viewer compare to the other options? Basically, it offers Internet Explorer 11 support, offers a wide range of attributes and even events. You can call a method when a document has been loaded or a page has been rendered. Plus, it offers two-way binding for many attributes, such as the page number and the zoom factor. You can store the user's zoom preference in the database and fetch it again the next morning, when the user starts working with a fresh browser.
