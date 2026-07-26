/*
 * Generates src/assets/pdfs/pdf-actions-demo.pdf - the demo document of the
 * "Advanced JavaScript" tab on /extended-pdf-viewer/scripting.
 *
 * The file exercises every JavaScript entry point pdf.js knows for a document:
 *
 *   /Names /JavaScript   document-level script, runs when the file is opened
 *   /OpenAction          runs when the file is opened  (enableOpenActionJavaScript)
 *   /AA /WC /WS /DS      WillClose, WillSave, DidSave  (enableCatalogAAJavaScript)
 *   /AA /WP /DP          WillPrint, DidPrint           (enableCatalogAAJavaScript)
 *   page /AA /O /C       PageOpen, PageClose
 *   widget /AA /Fo       Focus - clicking the field counts as a user gesture
 *
 * Every script appends a line to the text field "log", so the order of the
 * events stays visible even when app.alert() is suppressed (see below).
 *
 * Why only some scripts call app.alert(): pdf.js only shows an alert when a
 * user gesture happened within the last five seconds, and each alert consumes
 * that gesture (src/scripting_api/app.js). The print and save events explicitly
 * do NOT count as a gesture (src/scripting_api/event.js).
 *
 * Run it with:  node build-tools/make-pdf-actions-demo.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'pdfs', 'pdf-actions-demo.pdf');

/** Escapes the three characters that are special inside a PDF literal string. */
const str = (text) => `(${text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')})`;

/**
 * Body of an action script. `ngxLog()` is defined by the document-level script;
 * the fallback keeps the file useful even if that one is ever stripped.
 */
const script = (label, alertText, alertFirst = false) => {
  const log = `if (globalThis.ngxLog) { ngxLog("${label}"); } else { console.println("${label}"); }`;
  if (!alertText) {
    return log;
  }
  const alert = `app.alert("${alertText}");`;
  // WillClose runs while the viewer is tearing the document down, so the log
  // field may already be gone. Alert first - an exception in the log call would
  // otherwise swallow the rest of the script silently.
  return alertFirst ? `${alert} ${log}` : `${log} ${alert}`;
};

/** The document-level script: defines the logger the other scripts use. */
const DOC_LEVEL_SCRIPT = [
  'var ngxDoc = this;',
  'globalThis.ngxStep = 0;',
  'globalThis.ngxLog = function (name) {',
  '  globalThis.ngxStep = globalThis.ngxStep + 1;',
  '  var line = globalThis.ngxStep + ". " + name;',
  '  console.println(line);',
  '  var field = ngxDoc.getField("log");',
  '  if (field) { field.value = field.value + String.fromCharCode(10) + line; }',
  '};',
  'ngxLog("Document-level JavaScript (/Names /JavaScript)");',
].join(' ');

const PAGE_1_TEXT = [
  ['Helvetica-Bold', 17, 56, 726, 'Every JavaScript action a PDF file can have'],
  ['Helvetica', 11, 56, 700, 'Each action below writes one line into the log field, so you can watch the order of events.'],
  ['Helvetica-Bold', 11, 56, 672, 'Runs when the file is opened'],
  ['Helvetica', 11, 68, 654, 'document-level JavaScript  (/Names /JavaScript)  -  neither switch can turn this one off'],
  ['Helvetica', 11, 68, 638, 'OpenAction  (/OpenAction)  -  needs "enable Open Action JavaScript", shows an alert'],
  ['Helvetica', 11, 68, 622, 'PageOpen  (page /AA /O)  -  fires again for every page you scroll to'],
  ['Helvetica-Bold', 11, 56, 596, 'Runs later - all of these need "enable Catalog AA JavaScript"'],
  ['Helvetica', 11, 68, 578, 'WillPrint and DidPrint  (/AA /WP and /DP)  -  press Ctrl+P'],
  ['Helvetica', 11, 68, 562, 'WillSave and DidSave  (/AA /WS and /DS)  -  click the download button'],
  ['Helvetica', 11, 68, 546, 'WillClose  (/AA /WC)  -  in this file, but pdf.js drops it while closing the document'],
  ['Helvetica', 11, 68, 530, 'PageClose  (page /AA /C)  -  scroll away from a page'],
  ['Helvetica-Bold', 11, 56, 500, 'Click into the log field first, then press Ctrl+P.'],
  ['Helvetica', 10, 56, 484, 'pdf.js only shows an alert when you interacted with the document during the last five seconds,'],
  ['Helvetica', 10, 56, 470, 'and printing itself does not count. Without that click, WillPrint writes to the log but stays silent.'],
];

const PAGE_2_TEXT = [
  ['Helvetica-Bold', 17, 56, 726, 'Page 2'],
  ['Helvetica', 11, 56, 700, 'Scrolling here fired PageClose on page 1 and PageOpen on this page.'],
  ['Helvetica', 11, 56, 682, 'Scroll back to page 1 to read the log.'],
];

const contentStream = (lines) =>
  ['BT', ...lines.map(([font, size, x, y, text]) => `/${font === 'Helvetica-Bold' ? 'FB' : 'FR'} ${size} Tf 1 0 0 1 ${x} ${y} Tm ${str(text)} Tj`), 'ET'].join(
    '\n',
  );

const jsAction = (source) => `<< /Type /Action /S /JavaScript /JS ${str(source)} >>`;

// ---------------------------------------------------------------------------
// The objects. Object 0 is the free head, so index 1 is the first real object.
// ---------------------------------------------------------------------------
const page1Content = contentStream(PAGE_1_TEXT);
const page2Content = contentStream(PAGE_2_TEXT);

const objects = [
  // 1 - catalog
  `<< /Type /Catalog /Pages 2 0 R /AcroForm 9 0 R
     /OpenAction 12 0 R
     /Names << /JavaScript << /Names [(ngxDocLevel) 13 0 R] >> >>
     /AA << /WC 14 0 R /WS 15 0 R /DS 16 0 R /WP 17 0 R /DP 18 0 R >> >>`,
  // 2 - page tree
  `<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>`,
  // 3 - page 1
  `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
     /Resources << /Font << /FR 7 0 R /FB 8 0 R >> >>
     /Contents 4 0 R /Annots [10 0 R]
     /AA << /O 19 0 R /C 20 0 R >> >>`,
  // 4 - page 1 content
  `<< /Length ${page1Content.length} >>\nstream\n${page1Content}\nendstream`,
  // 5 - page 2
  `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
     /Resources << /Font << /FR 7 0 R /FB 8 0 R >> >>
     /Contents 6 0 R
     /AA << /O 21 0 R /C 22 0 R >> >>`,
  // 6 - page 2 content
  `<< /Length ${page2Content.length} >>\nstream\n${page2Content}\nendstream`,
  // 7 - regular font
  `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,
  // 8 - bold font
  `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,
  // 9 - AcroForm
  `<< /Fields [10 0 R] /DA (/Helv 0 Tf 0 g) /DR << /Font << /Helv 7 0 R >> >> >>`,
  // 10 - the log field. /Ff 4096 = multiline. The Focus action makes a click on
  //      the field a user gesture, which is what app.alert() needs.
  `<< /Type /Annot /Subtype /Widget /FT /Tx /Ff 4096 /T (log) /V ()
     /Rect [56 180 556 450] /DA (/Helv 10 Tf 0 g) /F 4 /P 3 0 R
     /MK << /BC [0.5 0.5 0.5] /BG [0.97 0.97 0.97] >>
     /AA << /Fo 23 0 R >> >>`,
  // 11 - unused, kept so the numbering below stays readable
  `<< /Type /Metadata /Subtype /XML /Length 0 >>\nstream\n\nendstream`,
  // 12 - OpenAction
  jsAction(script('OpenAction (/OpenAction)', 'OpenAction: this script ran while the document was being opened.')),
  // 13 - document-level JavaScript
  jsAction(DOC_LEVEL_SCRIPT),
  // 14 - WillClose. The log field is already gone at this point, so the alert
  //      is the only way to see this one. As of pdf.js 6.1 the viewer never
  //      gets this far: the sandbox is torn down before the event reaches it.
  jsAction(script('WillClose (/AA /WC)', 'WillClose: the viewer is about to close this document.', /* alertFirst = */ true)),
  // 15 - WillSave
  jsAction(script('WillSave (/AA /WS)')),
  // 16 - DidSave
  jsAction(script('DidSave (/AA /DS)')),
  // 17 - WillPrint
  jsAction(script('WillPrint (/AA /WP)', 'WillPrint: this runs before the print dialog opens.')),
  // 18 - DidPrint. No alert: the WillPrint alert has just used up the gesture.
  jsAction(script('DidPrint (/AA /DP)')),
  // 19 - page 1 PageOpen
  jsAction(script('PageOpen page 1 (/AA /O)')),
  // 20 - page 1 PageClose
  jsAction(script('PageClose page 1 (/AA /C)')),
  // 21 - page 2 PageOpen
  jsAction(script('PageOpen page 2 (/AA /O)')),
  // 22 - page 2 PageClose
  jsAction(script('PageClose page 2 (/AA /C)')),
  // 23 - Focus on the log field
  jsAction(script('Focus on the log field - the alerts are armed for five seconds')),
];

// ---------------------------------------------------------------------------
// Serialize.
// ---------------------------------------------------------------------------
let pdf = '%PDF-1.7\n%\xe2\xe3\xcf\xd3\n';
const offsets = [0];
objects.forEach((body, index) => {
  offsets.push(pdf.length);
  pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
});

const xrefOffset = pdf.length;
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (let i = 1; i <= objects.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

writeFileSync(OUT, Buffer.from(pdf, 'latin1'));
console.log(`wrote ${OUT} (${Buffer.byteLength(pdf, 'latin1')} bytes, ${objects.length} objects)`);
