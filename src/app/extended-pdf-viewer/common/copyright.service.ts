import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CopyrightService {
  private readonly copyrightHints: Record<string, string> = {
    '/assets/pdfs/BootsFaces_Deep_Dive_1.0.pdf': 'the PDF file is my own work.',
    './assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf': 'the e-book has been published by James Boyle under a CC BY-NC-SA 3.0 on www.thepublicdomain.org',
    './assets/pdfs/latex.pdf': 'the e-book has been published under a LATEX Project Public License, version 1.3c or later. on https://github.com/latex3/hyperref',
    '/assets/pdfs/themes_de_la_Science-fiction.pdf': 'the file has been published by Paroliver under a CC BY-SA 4.0 international license on commons.wikimedia.org',
    '/assets/pdfs/Portugues-para-principiantes-1538054164.pdf': 'The example PDF has been published under a Creative Commons (CC BY-NC-SA 3.0) license at https://wisc.pb.unizin.org/portuguese/',
    './assets/pdfs/2404.00465v1.pdf': 'the e-book has been published by A. Prillfool, A. A. Stoffers, I. Juodžbalis, M. S. Bothwell, and A. J. Wojcik under a CC BY-SA 4.0 license on https://arxiv.org/pdf/2404.00465 as an April Fool\'s joke.',
    '/assets/pdfs/blind-text-collection.pdf': 'the PDF file is my own work.',
    '/assets/pdfs/hammond-organ-wikipedia.pdf': 'the PDF file is available under CC BY-SA 4.0 unless otherwise noted. See the full details here: https://en.m.wikipedia.org/wiki/Hammond_organ',
    '/assets/pdfs/OoPdfFormExample.pdf': 'this presentation is my own work.',
    '/assets/pdfs/under-copyright/XFA-Canada-Immigration.pdf': 'this presentation is my own work.',
    '/assets/pdfs/pdf-sample.pdf': 'the PDF has been published by Stefan Hellweger and Xiaofeng Wang under a CC BY 3.0 on https://arxiv.org/abs/1503.01850',
    '/assets/pdfs/dachstein.pdf': 'the PDF file is my own work.',
    '/assets/pdfs/GraalVM-password-protected.pdf': 'this presentation is my own work.',
    '/assets/pdfs/CDK.pdf': 'the PDF file is my own work.',
    '/assets/pdfs/GraalVM.pdf': 'the PDF file is my own work.',
    './assets/pdfs/issue1707-with-rulers.pdf': 'the e-book has been published by James Boyle under a CC BY-NC-SA 3.0 on www.thepublicdomain.org',
    '/assets/pdfs/PdfFormExample.pdf': 'the PDF file has been published on Wikimedia by the anonymous user Paroliver under an CC BY-SA 4.0 license',
    '/assets/pdfs/user-experience.pdf': 'the PDF file has been published on Wikimedia by the anonymous user Paroliver under an CC BY-SA 4.0 license',
    '/assets/pdfs/OoPdfFormExample-dark.pdf': 'this presentation is my own work.',
    '/assets/pdfs/GraalVM Dictionary Bytecode, Interpreters, C1 Compiler, C2 Compiler, CPUs, and More.pdf': 'the PDF file is my own work.',
    '/assets/pdfs/slow-rendering.pdf': 'the PDF file has been published by Manuj Yadav, Jungsoo Kim, Valtteri Hongisto, Densil Cabrera, and Richard de Dear under a Creative Commons Attribution (CC BY) license (https://creativecommons.org/licenses/by/4.0/). See the full details on page 2 of the document.',
    '/assets/pdfs/160F-2019.pdf': 'the PDF file is part of test suite of the pdf.js project.',
    '/assets/pdfs/sample-forms.pdf': 'the PDF file is published with kind permission by Cristiano Rafael Steffens.',
    '/assets/pdfs/codpaste-teachingpack.pdf': 'Codpaste – Peaching Tack by People Like Us & Ergo Phizmiz is licensed under a Creative Commons Attribution-Noncommercial 2.0 UK: England & Wales License. See https://peoplelikeus.org/2007/codpaste-podcast-on-wfmu/ for details.'
  };

  getCopyrightHint(src: string): string | undefined {
    return this.copyrightHints[src];
  }

  getAllCopyrightHints(): Record<string, string> {
    return { ...this.copyrightHints };
  }

  addCopyrightHint(src: string, hint: string): void {
    this.copyrightHints[src] = hint;
  }
}
