```html
<!-- Pass a custom template to [customSidebar] -->
<ngx-extended-pdf-viewer
  [src]="pdfSrc"
  [customSidebar]="tocSidebar"
  [(sidebarVisible)]="sidebarOpen"
>
</ngx-extended-pdf-viewer>

<!-- The searchable TOC sidebar template -->
<ng-template #tocSidebar>
  <div id="viewsManager" class="toc-sidebar">
    <div class="toc-header">
      <input
        type="text"
        placeholder="Filter table of contents..."
        [(ngModel)]="tocFilter"
      />
    </div>

    <div class="toc-content">
      @for (entry of filteredToc; track entry.title) {
        <button
          class="toc-entry"
          [style.padding-left.px]="12 + entry.level * 16"
          (click)="goToPage(entry.page)"
        >
          <span>{{ entry.title }}</span>
          <button
            class="bookmark-btn"
            (click)="$event.stopPropagation();
                     toggleBookmark(entry.page, entry.title)"
          >
            <!-- star icon, filled if bookmarked -->
          </button>
        </button>
      }

      <!-- Bookmarks section appears when pages are starred -->
      @if (bookmarks.length > 0) {
        <div class="bookmarks-section">
          @for (bm of bookmarks; track bm.page) {
            <button (click)="goToPage(bm.page)">
              {{ bm.label }} — p. {{ bm.page }}
            </button>
          }
        </div>
      }
    </div>

    <div id="viewsManagerResizer" class="hidden"></div>
  </div>
</ng-template>
```
