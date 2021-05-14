import { Component } from '@angular/core';
import { IPDFViewerApplication, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { LogService } from '../../log.service';

@Component({
  selector: 'app-simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.css'],
})
export class SimpleComponent {
  // tslint:disable-next-line: variable-name
  public _selectedTab = 0;

  public page = 5;

  public pageLabel!: string;

  public showPdfViewer = true;

  public height = '90vh';

  /** This attribute is only used on browser without localStorage (e.g. Brave on iOS) */
  private themeIfLocalStorageIsUnavailable = "light";

  public set selectedTab(index: number) {
    if (localStorage) {
      localStorage.setItem(
        'ngx-extended-pdf-viewer.simple.selectedTab',
        String(index)
      );
    }
}

  public get selectedTab(): number {
    if (localStorage) {
      return (
        Number(
          localStorage.getItem('ngx-extended-pdf-viewer.simple.selectedTab')
        ) || 0
      );
    }
    return 0;
  }

  public set theme(theme: string) {
    if (theme !== this.theme && localStorage) {
      localStorage.setItem('ngx-extended-pdf-viewer.theme', theme);
      location = location;
    } else {
      this.themeIfLocalStorageIsUnavailable = theme;
      location = location;
    }
  }

  public get theme(): string {
    if (localStorage) {
      return localStorage.getItem('ngx-extended-pdf-viewer.theme') || 'light';
    } else {
      return this.themeIfLocalStorageIsUnavailable;
    }
  }

  constructor(public logService: LogService) {
    // pdfDefaultOptions.assetsFolder = 'bleeding-edge';
  }

  public onUpdateFindResult(event: any): void {
    console.log("UpdateFindResult " + event.matches);
  }

  public async getDiv(): Promise<void> {
    await this.getDivAtPosition(8, 20);
  }

  public async getDivAtPosition(page: number, position: number): Promise<void> {
    const PDFViewerApplication: IPDFViewerApplication = (window as any).PDFViewerApplication;
    if (!PDFViewerApplication.pdfViewer._pages[page].textLayer) {
      await PDFViewerApplication.pdfViewer._pages[page].draw();
    } else {
      const textLayer = PDFViewerApplication.pdfViewer._pages[page].textLayer;
      const divs = textLayer.textDivs;
      const textSnippets = textLayer.textContentItemsStr;
    }
  }
}
