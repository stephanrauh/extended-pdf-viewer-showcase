```typescript
 @Component({
  selector: 'app-simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.css']
})
export class SimpleComponent {
  public handTool = true;
  public page = 5;
  public pageLabel!: string;
  public rotation: 0 | 90 | 180 | 270 = 0;
  public scrollMode: ScrollModeType = ScrollModeType.vertical;
  public sidebarVisible = true;
  public activeSidebarView: PdfSidebarView = PdfSidebarView.THUMBS;
  public spread: 'off' | 'even' | 'odd' = 'off';
  public src = './assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf';
  public zoom: number | string = 'auto';
}
```
