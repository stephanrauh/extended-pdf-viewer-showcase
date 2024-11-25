```typescript
 @Component({
standalone: false, 
  selector: 'app-simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.css']
})
export class SimpleComponent {
  public page = 5;

  public pageLabel: string;
}
```
