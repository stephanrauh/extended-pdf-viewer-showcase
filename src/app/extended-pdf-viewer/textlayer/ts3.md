```typescript
@Component({
standalone: false,  ... })
export class TextlayerComponent {
  private alreadyRendered: Array<HTMLSpanElement> = [];

  public _markLongWords = false;

  public get markLongWords(): boolean {
    return this._markLongWords;
  }

  public set markLongWords(mark: boolean) {
    this._markLongWords = mark;
    this.alreadyRendered.forEach((span) => this.doMarkLongWordsInSpan(span));
  }

  public doMarkLongWordsInSpan(span: HTMLSpanElement): void {
    if (!this._markLongWords) {
      span.innerHTML = span.innerText.replace("\n", '');
    } else {
      const withMarks = span.innerText
        .split(' ')
        .map((t) => this.markOneLongWord(t))
        .join(' ');
      span.innerHTML = withMarks;
    }
  }

  private markOneLongWord(word: string): string {
    if (word.length > 6) {
      return `<div class="long-word">${word}</div>`;
    }
    return word;
  }

  public highlightWords(event: TextLayerRenderedEvent): void {
    event.source.textDivs.forEach((span) => {
      this.alreadyRendered.push(span);
    });

    if (this._markLongWords) {
      event.source.textDivs.forEach((span) => {
        this.doMarkLongWordsInSpan(span);
      });
    }
  }
}
```
