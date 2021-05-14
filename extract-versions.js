const fs = require('fs');

const angularPackageJsonFile = fs.readFileSync('./node_modules/@angular/core/package.json');
const angularPackageJson = JSON.parse(angularPackageJsonFile);
const angular = angularPackageJson['version'];

const ng2PdfViewerJsonFile = fs.readFileSync('./node_modules/ng2-pdf-viewer/package.json');
const ng2PdfViewerJson = JSON.parse(ng2PdfViewerJsonFile);
const ng2PdfViewer = ng2PdfViewerJson['version'];

const extendedPdfViewerJsonFile = fs.readFileSync('./node_modules/ngx-extended-pdf-viewer/package.json');
const extendedPdfViewerJson = JSON.parse(extendedPdfViewerJsonFile);
const extendedPdfViewer = extendedPdfViewerJson['version'];

const pdfJsDistJsonFile = fs.readFileSync('./node_modules/pdfjs-dist/package.json');
const pdfJsDistJson = JSON.parse(pdfJsDistJsonFile);
const pdfJsDist = pdfJsDistJson['version'];

const version =`export const versions = {
  angular: '${angular}',
  extendedPdfViewer: '${extendedPdfViewer}',
  ng2PdfViewer: '${ng2PdfViewer}',
  pdfJsDist: '${pdfJsDist}'
} `;

fs.writeFileSync("./src/app/nav/versions.ts", version);
