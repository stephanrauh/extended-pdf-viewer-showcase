```html
<!-- Pass a custom template to [customSidebar] -->
<ngx-extended-pdf-viewer
  [src]="pdfSrc"
  [customSidebar]="reviewSidebar"
  [(sidebarVisible)]="sidebarOpen"
>
</ngx-extended-pdf-viewer>

<!-- The review sidebar template -->
<ng-template #reviewSidebar>
  <div id="viewsManager" class="review-sidebar">
    <div class="review-header">
      <span>Comments ({{ comments.length }})</span>
      <div class="filters">
        <button (click)="filter = 'all'">All</button>
        <button (click)="filter = 'open'">Open</button>
        <button (click)="filter = 'resolved'">Resolved</button>
      </div>
    </div>

    <div class="review-list">
      @for (comment of filteredComments; track comment.id) {
        <div class="comment-card">
          <div class="avatar" [style.background]="comment.color">
            {{ comment.initials }}
          </div>
          <div class="comment-body">
            <strong>{{ comment.author }}</strong>
            <p>{{ comment.text }}</p>
          </div>
          <button
            class="status-badge"
            (click)="toggleStatus(comment)"
          >
            {{ comment.status }}
          </button>
        </div>
      }
    </div>

    <!-- Required: keeps the resize handle working -->
    <div id="viewsManagerResizer" class="hidden"></div>
  </div>
</ng-template>
```
