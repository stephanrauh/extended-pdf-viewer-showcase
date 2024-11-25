```typescript
@Component({
standalone: false,  ... })
export class KeyboardComponent implements OnInit {
  public ignoreKeyboard = false;

  public acceptKeys = ['j', 'k'];

  public ignoreKeys = [];

}
```
