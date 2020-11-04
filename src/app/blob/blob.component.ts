import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-blob',
  templateUrl: './blob.component.html',
  styleUrls: ['./blob.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlobComponent {
  public blob: Blob;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get('/assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf', { responseType: 'blob' })
      .subscribe(res => {
        this.blob = res;
      });
  }
}
