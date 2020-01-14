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
