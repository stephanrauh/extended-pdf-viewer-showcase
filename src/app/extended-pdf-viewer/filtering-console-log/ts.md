```typescript
@Component({
standalone: false, 
  selector: 'app-filtering-console-log',
  templateUrl: './filtering-console-log.component.html',
  styleUrls: ['./filtering-console-log.component.css'],
})
export class FilteringConsoleLogComponent {
  public version = '';

  constructor() {
    globalThis['ngxConsoleFilter'] = (level: string, message: any): boolean => {
      if (message?.includes && message?.includes('modified by ngx-extended-pdf-viewer')) {
          const index = message.indexOf('(PDF.js');
          this.version = message.substring(index + 1).replace(')', '');
          return false;
        }
        return true;
      };
    }
  }
}
```
