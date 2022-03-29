```typescript
 @Component({
  selector: 'app-iframe',
  templateUrl: './iframe.component.html',
  styleUrls: ['./iframe.component.css']
})
export class IFrameComponent {
  public url: string;
  constructor() {
    if (location.pathname.endsWith("cdk")) {
        this.url="/assets/pdfs/CDK.pdf";
    } else {
      this.url="/assets/pdfs/GraalVM.pdf";
    }
  }
}
```
