```typescript
export class FormsComponent {
  constructor(private ngxService: NgxExtendedPdfViewerService) {}

  public async readRawFormDescription(): Promise<void> {
    const raw = await this.ngxService.getFormData();
    this.rawFormData = raw.map((annotation: any) => ({
        alternativeText: annotation.fieldAnnotation.alternativeText,
        fieldName: annotation.fieldAnnotation.fieldName,
        fieldType: annotation.fieldAnnotation.fieldType,
        fieldValue: annotation.fieldAnnotation.fieldValue,
        id: annotation.fieldAnnotation.id,
        maxLen: annotation.fieldAnnotation.maxLen,
        rect: annotation.fieldAnnotation.rect
      }));
  }

}
```
