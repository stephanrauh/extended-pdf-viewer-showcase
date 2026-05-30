```typescript
@Component({
  selector: 'app-hidden-tabs',
  standalone: true,
  templateUrl: './hidden-tabs.component.html',
  imports: [NgxExtendedPdfViewerModule],
})
export class HiddenTabsComponent {
  public activeTab: 'tab1' | 'tab2' = 'tab1';
}
```
