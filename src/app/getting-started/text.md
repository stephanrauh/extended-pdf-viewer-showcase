# Getting started with this PDF viewer

This PDF viewer requires some configuration. That, in turn, has driven many good developers nuts.
So my recommendation is to check if `<ngx-extended-pdf-viewer>` works on your machine. That's a good basis to continue. If something does not work, it's probably something to do with different configurations.

So please clone this repository first:

```batch
git clone https://github.com/stephanrauh/extended-pdf-viewer-showcase.git
npm install
ng serve --open
```

## Prequisites

You need node.js, npm and a current version of Angular. This library works out-of-the-box with any version since Angular 6. However, I only test it with the most current version.

### Angular 2, 4, and 5

With a little effort, ngx-extended-pdf-viewer works with Angular 5 and Ionic 3. Thanks to GitHub user @tanzl88 for finding out how. They've also provided a running demo projekt: https://github.com/tanzl88/ionic-3-extended-pdf-viewer.

For technical reasons, the binary files of ngx-extended-pdf-viewer are not compatible with Angular 5 or below. So do not run npm install. Instead, copy these files into your local project:

- <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/blob/master/projects/ngx-extended-pdf-viewer/src/assets/pdf.js">pdf.js</a>
- <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/blob/master/projects/ngx-extended-pdf-viewer/src/assets/pdf.worker.js">pdf.worker.js</a>
- <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/blob/master/projects/ngx-extended-pdf-viewer/src/assets/viewer.js">viewer.js</a>
- <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/tree/master/projects/ngx-extended-pdf-viewer/src/lib">the folder ngx-extended-pdf-viewer</a>
- <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/tree/master/projects/ngx-extended-pdf-viewer/src/assets/locale">the locale folder</a>

After that, follow these steps:

1.  Load pdfjs in index.html
2.  Copy ngx-extended-pdf-viewer into component
3.  Change ngx-extended-pdf-viewer css file into ionic format (remove styleUrls)

### How to complain about trouble

If there's any compatibility issue with an older version of Angular, please tell me on [my bugtracker](https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues).

Talking about bugs and feature requests: I also listen to StackOverflow, but it may take some time until I pick up bug reports from StackOverflow.

## Installation

If you're familiar with Angular, you can get the PDF viewer up and running in roughly five minutes.

Install the library with `npm install`:

```batch
npm i ngx-extended-pdf-viewer --save
```

After that, it depends on how you created your library. I'll describe two approaches: the standard Angular CLI and JHipster.
