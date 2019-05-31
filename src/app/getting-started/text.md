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

You need node.js, npm and a current version of Angular. I believe this library works with any version since Angular 5. However, I only test it with the most current version. If there's any compatibility issue with an older version of Angular, please tell me on [my bugtracker](https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues).

Talking about bugs and feature requests: I also listen to StackOverflow, but it may take some time until I pick up bug reports from StackOverflow.

## Installation

Install the library with `npm install`:

```batch
npm i ngx-extended-pdf-viewer --save
```

After that, it depends on how you created your library. I'll describe two approaches: the standard Angular CLI and JHipster.
