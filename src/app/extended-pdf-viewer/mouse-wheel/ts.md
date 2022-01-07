```typescript
@Component({
  selector: 'app-mouse-wheel',
  templateUrl: './mouse-wheel.component.html',
  styleUrls: ['./mouse-wheel.component.css'],
})
export class MouseWheelComponent {
  public wheelAction: 'pagination' | 'zoom' = 'zoom';
}
```
