```ts
interface CustomFindOptions extends FindOptions {
  matchRegex: boolean;
}

@Component({...})
export class CustomFindComponent {
  searchtext = '(?<=\\s)([A-z]+ough)';
  findOptions: CustomFindOptions = {
    highlightAll: true,
    matchCase: false,
    wholeWords: false,
    matchDiacritics: false,
    matchRegex: true
  };

  // Override the find feature to support regex after the PDF is loaded
  pdfLoaded() {
    this.overrideFindFeature();
  }

  // Optional: Restore the original find feature
  ngOnDestroy() {
    this.restoreFindFeature();
  }

  findRegex() {
    this.dispatchFind('find');
  }

  findNext(): void {
    this.dispatchFind('again', false);
  }

  findPrevious(): void {
    this.dispatchFind('again', true);
  }

  /**
   * Override the find feature to support regex
   */
  private overrideFindFeature() {
    const findController = this.pdfViewerApplication.findController as any;

    const originalConvertToRegExpString = findController._convertToRegExpString;
    findController._convertToRegExpString = (query: string, ...args: any[]) => {
      const { matchRegex } = findController.state;

      // If not matchRegex, call the original method
      if (!matchRegex) return originalConvertToRegExpString.call(findController, query, ...args);

      // If matchRegex, return the query as is
      return [false, query];
    };
  }

  // Need to use dispatch directly
  private dispatchFind(type: string, findPrevious = false): void {
    this.pdfViewerApplication.eventBus.dispatch('find', {
      ...this.findOptions,
      query: this.searchtext,
      type,
      findPrevious,
      source: undefined
    });
  }
}
```
