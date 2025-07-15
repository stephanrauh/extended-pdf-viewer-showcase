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

## getCurrentDocumentAsBlob(): Promise&lt;Blob | undefined&gt;

Returns the current document as a Blob for further processing.

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