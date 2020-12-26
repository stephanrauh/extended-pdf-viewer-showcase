### Angular 2, 4, 5, and Ionic 3

With a little effort, ngx-extended-pdf-viewer works with Angular 5 and Ionic 3. Thanks to GitHub user @tanzl88 for finding out how. They've also provided a running demo projekt: https://github.com/tanzl88/ionic-3-extended-pdf-viewer.

For technical reasons, the binary files of ngx-extended-pdf-viewer are not compatible with Angular 5 or below. So do not run npm install. Instead, copy these files into your local project:

- <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/blob/master/projects/ngx-extended-pdf-viewer/src/assets/pdf.js">pdf.js</a>
- <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/blob/master/projects/ngx-extended-pdf-viewer/src/assets/pdf.worker.js">pdf.worker.js</a>
- <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/blob/master/projects/ngx-extended-pdf-viewer/src/assets/viewer.js">viewer.js</a>
- <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/tree/master/projects/ngx-extended-pdf-viewer/src/lib">the folder ngx-extended-pdf-viewer</a>
- <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/tree/master/projects/ngx-extended-pdf-viewer/src/assets/locale">the locale folder</a>
- <a href="https://github.com/stephanrauh/ngx-extended-pdf-viewer/tree/master/projects/ngx-extended-pdf-viewer/src/assets/cmaps">the cmaps folder</a> if you want to display East-Asian character sets

After that, follow these steps:

1.  Do *not* add ngx-extended-pdf-viewer to the `package.json`
2.  Only if it's an Ionic 3 project: Change ngx-extended-pdf-viewer css file into ionic format (remove styleUrls)
3.  Maybe you also have to load `viewer.js` and `pdf.js` in the `index.html`. However, these files are loaded automatically, so that step is probably not necessary since ngx-extended-pdf-viewer 2.0.0.
