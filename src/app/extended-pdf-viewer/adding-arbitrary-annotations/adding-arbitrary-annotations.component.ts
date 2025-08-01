import { Component, effect, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { IPDFViewerApplication, NgxExtendedPdfViewerModule, PDFNotificationService } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';
import { PDFDocument, PDFString, PDFName, PDFArray } from 'pdf-lib';

@Component({
  selector: 'app-base64',
  standalone: true,
  templateUrl: './adding-arbitrary-annotations.component.html',
  styleUrls: ['./adding-arbitrary-annotations.component.css'],
  imports: [Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, AsyncPipe],
})
export class AddingArbitraryAnnotationsComponent {
  public fullscreenService = inject(FullscreenService);
  private themeService = inject(ThemeService);
  private notificationService = inject(PDFNotificationService);

  public activeTab = 'html';

  public get theme(): string {
    return this.themeService.theme();
  }

  public pdfSrc: string | undefined = '/assets/pdfs/user-experience.pdf';
  private PDFViewerApplication: IPDFViewerApplication | undefined;

  private stickyNotes: Array<{ x: number; y: number; content: string; author: string; pageIndex: number }> = [];

  constructor() {
    effect(() => {
      this.PDFViewerApplication = this.notificationService.onPDFJSInitSignal();
    });
  }

  /**
   * Add demo sticky notes
   */
  public async addDemoStickyNotes(): Promise<void> {
    await this.addStickyNote(0, 100, 100, 'Demo annotation', 'Demo User');
  }

  /**
   * Reset to original PDF
   */
  public resetToOriginalPDF(): void {
    this.stickyNotes = [];
    this.pdfSrc = '/assets/pdfs/user-experience.pdf';
  }

  /**
   * Get current sticky notes count
   */
  public getStickyNotesCount(): number {
    return this.stickyNotes.length;
  }

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

    // Create two annotations: background square + foreground sticky note
    const noteSize = 20;
    const squareSize = 40; // Larger for better print visibility

    // 1. Large yellow square behind (for print only)
    const squareRect = [x - 10, pdfY - squareSize, x + squareSize - 10, pdfY];
    const squareAnnotation = pdfDoc.context.obj({
      Type: PDFName.of('Annot'),
      Subtype: PDFName.of('Square'),
      Rect: squareRect,
      Contents: PDFString.of(`${content} (${author})`),
      T: PDFString.of(author),
      C: [1, 1, 0], // Yellow color
      F: 4 + 32, // Print flag (4) + NoView flag (32) = print only, not visible on screen
      M: PDFString.of(new Date().toISOString()),
      CreationDate: PDFString.of(new Date().toISOString()),
      BS: pdfDoc.context.obj({
        W: 3, // Thick border for print visibility
        S: PDFName.of('S'),
      }),
    });

    // 2. Classic sticky note icon (for screen interaction)
    const noteRect = [x, pdfY - noteSize, x + noteSize, pdfY];
    const noteAnnotation = pdfDoc.context.obj({
      Type: PDFName.of('Annot'),
      Subtype: PDFName.of('Text'),
      Rect: noteRect,
      Contents: PDFString.of(content),
      T: PDFString.of(author),
      Name: PDFName.of('Note'), // Classic sticky note icon
      Open: false,
      C: [1, 1, 0], // Yellow color
      F: 0, // Don't print the icon (we have the square for that)
      M: PDFString.of(new Date().toISOString()),
      CreationDate: PDFString.of(new Date().toISOString()),
    });

    // Add both annotations to the page
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

    // Add square first (behind), then note (in front)
    if (annots instanceof PDFArray) {
      annots.push(pdfDoc.context.register(squareAnnotation)); // Background
      annots.push(pdfDoc.context.register(noteAnnotation));   // Foreground
    }

    // Save and return the modified PDF
    return await pdfDoc.save();
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
}
