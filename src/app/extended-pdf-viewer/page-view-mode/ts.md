```typescript
 @Component({
standalone: false, 
  selector: 'app-page-view-mode',
  templateUrl: './page-view-mode.component.html',
  styleUrls: ['./page-view-mode.component.css']
})
export class PageViewModeComponent {

  public page = 5;

  public spreadMode: "off" | "even" | "odd" = "off";
}
```
