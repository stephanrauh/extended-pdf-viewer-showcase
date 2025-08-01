```typescript
/**
   * Add annotation to PDF using pdf-lib
   */
  private async addAnnotationToPDF(pdfBytes: Uint8Array, pageIndex: number, x: number, y: number, content: string, author: string): Promise<Uint8Array> {
    // Load PDF with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const page = pages[pageIndex];

    if (!page) {
      throw new Error(`Page ${pageIndex} not found`);
    }

    const { width, height } = page.getSize();

    // Convert coordinates (PDF.js uses top-left origin, PDF uses bottom-left)
    const pdfY = height - y;

    // Use a text annotation with Note icon for better visibility
    const annotationSize = 20;
    const annotationRect = [x, pdfY - annotationSize, x + annotationSize, pdfY];

    // Create annotation with proper pdf-lib format
    const annotation = pdfDoc.context.obj({
      Type: PDFName.of('Annot'),
      Subtype: PDFName.of('Text'), // Text annotation shows as a note icon
      Rect: annotationRect,
      Contents: PDFString.of(content),
      T: PDFString.of(author),
      Name: PDFName.of('Note'), // This creates the classic "sticky note" icon
      Open: false, // Start closed
      C: [1, 1, 0], // Yellow color
      F: 4, // Print flag - makes annotation appear in print
      M: PDFString.of(new Date().toISOString()),
      CreationDate: PDFString.of(new Date().toISOString()),
    });

    // Add annotation to the page
    const pageRef = page.ref;
    const pageObj: any = pdfDoc.context.lookup(pageRef);

    if (!pageObj) {
      throw new Error(`pageObj ${pageIndex} not found`);
    }

    // Get or create annotations array
    let annots = pageObj.get(PDFName.of('Annots'));
    if (!annots) {
      annots = pdfDoc.context.obj([]);
      pageObj.set(PDFName.of('Annots'), annots);
    }

    // Add our annotation to the array
    if (annots instanceof PDFArray) {
      annots.push(pdfDoc.context.register(annotation));
    }

    // Save and return the modified PDF
    return await pdfDoc.save();
  }

```
