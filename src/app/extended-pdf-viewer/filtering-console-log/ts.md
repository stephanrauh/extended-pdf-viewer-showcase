```typescript
@Component({
  selector: 'app-filtering-console-log',
  templateUrl: './filtering-console-log.component.html',
  styleUrls: ['./filtering-console-log.component.css'],
})
export class FilteringConsoleLogComponent {
  public version = '';

  constructor() {
    Window['ngxConsoleFilter'] = (level: string, message: any): boolean => {
      if (message.includes('running on')) {
        this.version = message;
        return false;
      }
      return true;
    }
  }
}
```
