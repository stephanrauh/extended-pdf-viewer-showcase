```typescript
  /**
   * Add a sticky note and immediately update the PDF
   */
  private async addStickyNote(pageIndex: number, x: number, y: number, content: string, author: string = 'User'): Promise<void> {
    if (!this.PDFViewerApplication?.pdfDocument) {
      console.error('PDF not loaded');
      return;
    }

    try {
      // Add to our sticky notes array
      this.stickyNotes.push({ x, y, content, author, pageIndex });

      // Get current PDF data
      const pdfBytes = await this.PDFViewerApplication.pdfDocument.getData();

      // Modify PDF with pdf-lib
      const modifiedPdfBytes = await this.addAnnotationToPDF(pdfBytes, pageIndex, x, y, content, author);

      // Update the viewer with the new PDF
      await this.loadModifiedPDF(modifiedPdfBytes);
    } catch (error) {
      console.error('Error adding sticky note:', error);
    }
  }

  /**
   * Load the modified PDF into the viewer
   */
  private async loadModifiedPDF(pdfBytes: Uint8Array): Promise<void> {
    try {
      // Create blob URL for the modified PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Update the PDF source to load the new PDF
        this.pdfSrc = url;
    } catch (error) {
      console.error('Error loading modified PDF:', error);
    }
  }
  ```
