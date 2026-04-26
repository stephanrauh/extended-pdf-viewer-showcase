import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { NgxExtendedPdfViewerService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { FullscreenService } from '../../services/fullscreen.service';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

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

interface Bookmark {
  page: number;
  label: string;
}

interface TocEntry {
  title: string;
  page: number;
  level: number;
}

@Component({
  selector: 'app-custom-sidebar',

  standalone: true,
  templateUrl: './custom-sidebar.component.html',
  styleUrls: ['./custom-sidebar.component.css'],
  imports: [FormsModule, Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective, AsyncPipe],
})
export class CustomSidebarComponent {
  private cdr = inject(ChangeDetectorRef);
  private pdfService = inject(NgxExtendedPdfViewerService);
  public fullscreenService = inject(FullscreenService);

  public activeTab = 'html';
  public theme = 'light';
  public showPdfViewer = true;
  public sidebarOpen = true;

  public _sidebarType = 'review';

  // -- Review sidebar data --
  public reviewComments: ReviewComment[] = [
    { id: 1, page: 1, author: 'Alice Chen', initials: 'AC', color: '#6366f1', text: 'The introduction needs a stronger opening statement.', timestamp: '2 hours ago', status: 'open' },
    { id: 2, page: 1, author: 'Bob Martinez', initials: 'BM', color: '#f59e0b', text: 'Looks good to me. Approved.', timestamp: '1 hour ago', status: 'resolved' },
    { id: 3, page: 2, author: 'Carol Wu', initials: 'CW', color: '#10b981', text: 'Can we add a diagram here to illustrate the architecture?', timestamp: '45 min ago', status: 'open' },
    { id: 4, page: 2, author: 'Alice Chen', initials: 'AC', color: '#6366f1', text: 'The font size in this section seems inconsistent.', timestamp: '30 min ago', status: 'open' },
    { id: 5, page: 3, author: 'Dan Okafor', initials: 'DO', color: '#ef4444', text: 'Great summary! No changes needed.', timestamp: '15 min ago', status: 'resolved' },
  ];

  public reviewFilter: 'all' | 'open' | 'resolved' = 'all';

  // -- Searchable TOC data --
  public tocEntries: TocEntry[] = [
    { title: 'Introduction', page: 1, level: 0 },
    { title: 'Getting Started', page: 1, level: 1 },
    { title: 'Installation', page: 1, level: 1 },
    { title: 'Features Overview', page: 2, level: 0 },
    { title: 'Toolbar Customization', page: 2, level: 1 },
    { title: 'Sidebar Options', page: 2, level: 1 },
    { title: 'Theming', page: 2, level: 1 },
    { title: 'Advanced Usage', page: 3, level: 0 },
    { title: 'Annotations', page: 3, level: 1 },
    { title: 'Form Support', page: 3, level: 1 },
    { title: 'Printing', page: 3, level: 1 },
  ];

  public tocFilter = '';
  public bookmarks: Bookmark[] = [];

  get filteredToc(): TocEntry[] {
    if (!this.tocFilter.trim()) {
      return this.tocEntries;
    }
    const query = this.tocFilter.toLowerCase();
    return this.tocEntries.filter(e => e.title.toLowerCase().includes(query));
  }

  get filteredComments(): ReviewComment[] {
    if (this.reviewFilter === 'all') {
      return this.reviewComments;
    }
    return this.reviewComments.filter(c => c.status === this.reviewFilter);
  }

  get commentPages(): number[] {
    const pages = [...new Set(this.filteredComments.map(c => c.page))];
    return pages.sort((a, b) => a - b);
  }

  commentsForPage(page: number): ReviewComment[] {
    return this.filteredComments.filter(c => c.page === page);
  }

  public newCommentText = '';
  private nextCommentId = 10;

  toggleCommentStatus(comment: ReviewComment): void {
    comment.status = comment.status === 'open' ? 'resolved' : 'open';
  }

  deleteComment(comment: ReviewComment): void {
    this.reviewComments = this.reviewComments.filter(c => c.id !== comment.id);
  }

  addComment(): void {
    const text = this.newCommentText.trim();
    if (!text) return;

    const page = (this.pdfService.currentPageIndex() ?? 0) + 1;
    this.reviewComments.push({
      id: this.nextCommentId++,
      page,
      author: 'You',
      initials: 'YO',
      color: '#8b5cf6',
      text,
      timestamp: 'just now',
      status: 'open',
    });
    this.newCommentText = '';
  }

  goToPage(page: number): void {
    this.pdfService.scrollPageIntoView(page);
  }

  toggleBookmark(page: number, label: string): void {
    const index = this.bookmarks.findIndex(b => b.page === page);
    if (index >= 0) {
      this.bookmarks.splice(index, 1);
    } else {
      this.bookmarks.push({ page, label });
      this.bookmarks.sort((a, b) => a.page - b.page);
    }
  }

  isBookmarked(page: number): boolean {
    return this.bookmarks.some(b => b.page === page);
  }

  // -- Sidebar type switching --
  public set sidebarType(sidebarType: string) {
    if (this._sidebarType !== sidebarType) {
      this.showPdfViewer = false;
      this._sidebarType = sidebarType;
      setTimeout(() => {
        this.showPdfViewer = true;
        this.cdr.markForCheck();
      }, 500);
    } else {
      this._sidebarType = sidebarType;
    }
  }

  public get sidebarType(): string {
    return this._sidebarType;
  }
}
