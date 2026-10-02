# Debugging and reporting bugs

## Compare with a configuration that works

Before you start debugging, check if the viewer works in a fresh project or in this showcase (see the tab "Setup and installation"). If it does, the difference between the two configurations is a good starting point.

## Debugging the JavaScript code

This library consists of two parts: the base library, pdf.js, and the TypeScript code. Debugging the TypeScript code is usually straightforward. Unfortunately, most errors occur in the base library, and it's difficult to find out what's going on in the minified code.

So activate `[minifiedJSLibraries]="false"`. The viewer loads a bit slower, but you can read the error message and debug the JavaScript code.

## Messages in the console

- "worker destroyed" or "transport destroyed" means the viewer was destroyed while it was still rendering, e.g. because the user closed a modal quickly. That's harmless.
- You can filter the messages of the viewer with a <a href="/extended-pdf-viewer/filtering-console-log">console filter</a>, and reduce them with `[logLevel]`.

## Reporting a bug

Please report bugs and feature requests on <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues">the bug tracker</a>. That's also the place to tell me about compatibility problems. If you report an error, please include the error message and the stack trace of the non-minified code. A small reproducer, or a link to a PDF file that shows the problem, helps a lot.

I also read StackOverflow, but it may take some time until I pick up bug reports from there.
