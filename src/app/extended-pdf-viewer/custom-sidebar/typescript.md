```typescript
interface ReviewComment {
  id: number;
  page: number;
  author: string;
  initials: string;
  color: string;
  text: string;
  timestamp: string;
  status: 'open' | 'resolved';
}

@Component({ ... })
export class CustomSidebarComponent {
  private pdfService = inject(NgxExtendedPdfViewerService);

  reviewComments: ReviewComment[] = [/* mock data */];
  reviewFilter: 'all' | 'open' | 'resolved' = 'all';
  newCommentText = '';

  get filteredComments(): ReviewComment[] {
    if (this.reviewFilter === 'all') return this.reviewComments;
    return this.reviewComments.filter(c => c.status === this.reviewFilter);
  }

  toggleCommentStatus(comment: ReviewComment): void {
    comment.status = comment.status === 'open' ? 'resolved' : 'open';
  }

  deleteComment(comment: ReviewComment): void {
    this.reviewComments = this.reviewComments.filter(c => c.id !== comment.id);
  }

  addComment(): void {
    const text = this.newCommentText.trim();
    if (!text) return;
    const page = this.pdfService.currentPageIndex() + 1;
    this.reviewComments.push({
      id: Date.now(), page,
      author: 'You', initials: 'YO', color: '#8b5cf6',
      text, timestamp: 'just now', status: 'open',
    });
    this.newCommentText = '';
  }

  goToPage(page: number): void {
    this.pdfService.scrollPageIntoView(page);
  }
}
```
