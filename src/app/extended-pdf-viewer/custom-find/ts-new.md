```ts
@Component({...})
export class CustomFindComponent {

  constructor() {
    pdfDefaultOptions.findController = MyCustomFindController;
  }
}
```
