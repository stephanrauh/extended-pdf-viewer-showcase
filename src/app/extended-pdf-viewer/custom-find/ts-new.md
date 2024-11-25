```ts
@Component({
standalone: false, ...})
export class CustomFindComponent {

  constructor() {
    pdfDefaultOptions.findController = MyCustomFindController;
  }
}
```
