import { Component, OnInit } from '@angular/core';

(window as any).updateThumbnailSelection = (page: number) => {
  setTimeout(() => {
    const checkboxes = document.getElementsByClassName('thumbnail-checkbox');
    if (checkboxes) {
      for (let i = 1; i <= checkboxes.length; i++) {
        const cbx = checkboxes.item(i - 1) as HTMLInputElement;
        cbx.checked = i === page + 1;
      }
    }
  });
};

@Component({
  selector: 'app-custom-thumbnails',
  templateUrl: './custom-thumbnails.component.html',
  styleUrls: ['./custom-thumbnails.component.css'],
})
export class CustomThumbnailsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  public onPageChange(page: number): void {
    const checkboxes = document.getElementsByClassName('thumbnail-checkbox');
    if (checkboxes) {
      for (let i = 1; i <= checkboxes.length; i++) {
        const cbx = checkboxes.item(i - 1) as HTMLInputElement;
        cbx.checked = i === page + 1;
      }
    }
  }
}
