# Page Management Methods

## movePage(fromIndex: number, toIndex: number): void

Moves a page from one position to another. Requires `enablePageReordering` to be enabled.

```typescript
// Move page 3 to position 1
this.pdfService.movePage(3, 1);

// Move current page up
const currentPage = this.pdfService.getCurrentPage();
if (currentPage > 1) {
  this.pdfService.movePage(currentPage, currentPage - 1);
}
```

## getCurrentPage(): number

Returns the current page number (1-indexed).

```typescript
const currentPage = this.pdfService.getCurrentPage();
console.log('Current page:', currentPage);
```

## getPageCount(): number

Returns the total number of pages in the document.

```typescript
const totalPages = this.pdfService.getPageCount();
console.log('Total pages:', totalPages);
```

## Requirements

- Set `pdfDefaultOptions.enablePageReordering = true` in your component constructor
- Ensure the PDF document is fully loaded before calling these methods
- Page indices are 1-based (first page = 1, not 0)
- Use `ngAfterViewInit` or similar lifecycle hooks to ensure the viewer is ready