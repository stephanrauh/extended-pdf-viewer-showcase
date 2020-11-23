```typescript
@Component({
  selector: 'app-blob',
  templateUrl: './blob.component.html',
  styleUrls: ['./blob.component.css'],
})
export class BlobComponent implements OnInit {
  public src = 'some.pdf';

  public downloaded: string | undefined;

  constructor(private ngxService: NgxExtendedPdfViewerService) {}

  public async downloadAsBlob(): Promise<void> {
    const blob = await this.ngxService.getCurrentDocumentAsBlob();
    if (blob) {
      this.downloaded = 'The BLOB contains ' + blob.size + ' byte.';
    } else {
      this.downloaded = 'download failed';
    }
  }
}
```
