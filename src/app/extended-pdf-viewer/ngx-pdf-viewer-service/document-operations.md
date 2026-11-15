# Document Control Methods

## print(): void

Opens the print dialog for the current document.

```typescript
this.pdfService.print();
```

## download(): void

Downloads the current document.

```typescript
this.pdfService.download();
```

## getCurrentDocumentAsBlob(options?): Promise&lt;Blob | undefined&gt;

Returns the current document as a Blob for further processing, including the form values and annotations the user added.

Version 32, bleeding edge only: `getCurrentDocumentAsBlob({ flatten: true })` draws the form fields and annotations into the page, so nobody can edit them any more. `flatten: 'non-forms'` flattens the annotations but keeps the form fields. `intent` (`'print'`, the default, or `'display'`) decides which fields count as visible. Links stay clickable.

The flattened file is a bit larger than the original: pdf.js appends the flattened pages and keeps the original file inside it. So flattening isn't redaction: the original content, including values that were filled in before, can still be recovered.

```typescript
try {
  const blob = await this.pdfService.getCurrentDocumentAsBlob();
  if (blob) {
    // Process the blob (e.g., save to file, upload to server)
    const url = URL.createObjectURL(blob);
    // Use the URL as needed
  }
} catch (error) {
  console.error('Failed to get document as blob:', error);
}
```

## find(text: string, options?: FindOptions): void

Searches for text in the document with optional search parameters.

```typescript
// Basic search
this.pdfService.find('search term');

// Advanced search with options
this.pdfService.find('search term', {
  matchCase: true,
  wholeWords: true,
  highlightAll: true
});
```

## findNext() / findPrevious()

Navigate through search results.

```typescript
this.pdfService.findNext();
this.pdfService.findPrevious();
```