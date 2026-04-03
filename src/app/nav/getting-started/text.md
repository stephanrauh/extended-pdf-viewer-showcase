# Getting Started

## Prerequisites

You can get the PDF viewer up and running in roughly two minutes. You need node.js, npm and a current version of Angular. Plus, you need to configure your server to support \*.mjs files with the correct MIME type. See the <a href="/extended-pdf-viewer/troubleshooting">troubleshooting</a> page to learn how to configure your server.

## Which Angular version do you need?

There are no promises - but this library aims to be compatible to the last four versions of Angular, which gives you two years time to update. Version 26 requires Angular 19 through 21. It supports signals and zone-less Angular, so I had to raise the bar a bit. If you're stuck on an older Angular version, you'll need to use an older version of ngx-extended-pdf-viewer.

With very few exceptions, I only maintain the most current version of the viewer. As much as I'd like to provide bug fixes to older versions, I don't have enough time to spare.

## Just in case you haven't got an Angular project yet

The instructions below assume you've already got an Angular project. If you haven't, here's what to do:

- Install node.js. Make sure it's a current version with an even version number.
- Install the Angular CLI by running the command `npm i -g @angular/cli`.
- Create a new Angular app by running the command `ng new my-favorite-project`.

I've described these steps in more detail <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/2010#issuecomment-1850778118">here</a>.

## Setting up the PDF viewer
