import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CopyrightService {
  private readonly copyrightHints: Record<string, string> = {
    'BootsFaces_Deep_Dive_1.0.pdf': 'The PDF file is my own work.',
    'The Public Domain - Enclosing the Commons of the Mind.pdf': 'the e-book has been published by James Boyle under a CC BY-NC-SA 3.0 on www.thepublicdomain.org',
    'latex.pdf': 'the e-book has been published under a LATEX Project Public License, version 1.3c or later. on https://github.com/latex3/hyperref',
    'themes_de_la_Science-fiction.pdf': 'the file has been published by Paroliver under a CC BY-SA 4.0 international license on commons.wikimedia.org',
    'Portugues-para-principiantes-1538054164.pdf': 'The example PDF has been published under a Creative Commons (CC BY-NC-SA 3.0) license at https://wisc.pb.unizin.org/portuguese/',
    '2404.00465v1.pdf': 'the e-book has been published by A. Prillfool, A. A. Stoffers, I. Juodžbalis, M. S. Bothwell, and A. J. Wojcik under a CC BY-SA 4.0 license on https://arxiv.org/pdf/2404.00465 as an April Fool\'s joke.',
    'blind-text-collection.pdf': 'The PDF file is my own work.',
    'hammond-organ-wikipedia.pdf': 'the PDF file is available under CC BY-SA 4.0 unless otherwise noted. See the full details here: https://en.m.wikipedia.org/wiki/Hammond_organ',
    'OoPdfFormExample.pdf': 'this presentation is my own work.',
    'under-copyright/XFA-Canada-Immigration.pdf': 'this presentation is my own work.',
    'pdf-sample.pdf': 'the PDF has been published by Stefan Hellweger and Xiaofeng Wang under a CC BY 3.0 on https://arxiv.org/abs/1503.01850',
    'dachstein.pdf': 'The PDF file is my own work.',
    'GraalVM-password-protected.pdf': 'this presentation is my own work.',
    'CDK.pdf': 'The PDF file is my own work.',
    'GraalVM.pdf': 'The PDF file is my own work.',
    'issue1707-with-rulers.pdf': 'the e-book has been published by James Boyle under a CC BY-NC-SA 3.0 on www.thepublicdomain.org',
    'PdfFormExample.pdf': 'the PDF file has been published on Wikimedia by the anonymous user Paroliver under an CC BY-SA 4.0 license',
    'user-experience.pdf': 'the PDF file has been published on Wikimedia by the anonymous user Paroliver under an CC BY-SA 4.0 license',
    'OoPdfFormExample-dark.pdf': 'this presentation is my own work.',
    'GraalVM Dictionary Bytecode, Interpreters, C1 Compiler, C2 Compiler, CPUs, and More.pdf': 'The PDF file is my own work.',
    'slow-rendering.pdf': 'the PDF file has been published by Manuj Yadav, Jungsoo Kim, Valtteri Hongisto, Densil Cabrera, and Richard de Dear under a Creative Commons Attribution (CC BY) license (https://creativecommons.org/licenses/by/4.0/). See the full details on page 2 of the document.',
    '160F-2019.pdf': 'the PDF file is part of test suite of the pdf.js project.',
    'sample-forms.pdf': 'the PDF file is published with kind permission by Cristiano Rafael Steffens.',
    'codpaste-teachingpack.pdf': 'Codpaste – Peaching Tack by People Like Us & Ergo Phizmiz is licensed under a Creative Commons Attribution-Noncommercial 2.0 UK: England & Wales License. See https://peoplelikeus.org/2007/codpaste-podcast-on-wfmu/ for details.',
    'ngx-extended-pdf-viewer-flyer.pdf': 'The PDF file is my own work.',
    'unverified-signature.pdf': 'the PDF file is published with kind permission by Cristiano Rafael Steffens (see https://github.com/stephanrauh/ngx-extended-pdf-viewer/issues/514#issuecomment-720089147).'
  };

  getCopyrightHint(src: string): string | undefined {
    let key = src;
    const index = src.lastIndexOf("/");
    if (index >= 0) {
      key = src.substring(index+1);
    }
    return this.copyrightHints[key];
  }

  getAllCopyrightHints(): Record<string, string> {
    return { ...this.copyrightHints };
  }

  addCopyrightHint(src: string, hint: string): void {
    this.copyrightHints[src] = hint;
  }
}
