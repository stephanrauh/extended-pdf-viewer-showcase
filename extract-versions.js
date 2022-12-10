const fs = require('fs');

const angularPackageJsonFile = fs.readFileSync('./node_modules/@angular/core/package.json');
const angularPackageJson = JSON.parse(angularPackageJsonFile);
const angular = angularPackageJson['version'];

const extendedPdfViewerJsonFile = fs.readFileSync('./node_modules/ngx-extended-pdf-viewer/package.json');
const extendedPdfViewerJson = JSON.parse(extendedPdfViewerJsonFile);
const extendedPdfViewer = extendedPdfViewerJson['version'];

const version =`export const versions = {
  angular: '${angular}',
  extendedPdfViewer: '${extendedPdfViewer}',
} `;

fs.writeFileSync("./src/app/nav/versions.ts", version);
