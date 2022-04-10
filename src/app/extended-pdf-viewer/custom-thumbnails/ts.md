```typescript
(window as any).updateThumbnailSelection = (page: number) => {
  (window as any).PDFViewerApplication.page = page;
  setTimeout(() => {
    const radiobuttons = document.getElementsByClassName('thumbnail-radiobutton');
    if (radiobuttons) {
      for (let i = 1; i <= radiobuttons.length; i++) {
        const cbx = radiobuttons.item(i - 1) as HTMLInputElement;
        cbx.checked = i === page + 1;
      }
    }
  });
};

@Component({
  selector: 'app-custom-thumbnails',
  templateUrl: './custom-thumbnails.component.html',
  styleUrls: ['./custom-thumbnails.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomThumbnailsComponent {
  public onPageChange(page: number): void {
    const radiobuttons = document.getElementsByClassName('thumbnail-radiobutton');
    if (radiobuttons) {
      for (let i = 1; i <= radiobuttons.length; i++) {
        const cbx = radiobuttons.item(i - 1) as HTMLInputElement;
        cbx.checked = i === page + 1;
      }
    }
  }
}
```
