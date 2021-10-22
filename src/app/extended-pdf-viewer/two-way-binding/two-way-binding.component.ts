import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ScrollModeType } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-two-way-binding',
  templateUrl: './two-way-binding.component.html',
  styleUrls: ['./two-way-binding.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TwoWayBindingComponent {
  // tslint:disable-next-line: variable-name
  public _selectedTab = 0;

  public handTool = true;

  public page = 5;

  public pageLabel!: string;

  public rotation: 0 | 90 | 180 | 270 = 0;

  public scrollMode: ScrollModeType = ScrollModeType.vertical;

  public sidebarVisible = true;

  public src = './assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf';

  @Input()
  public spreadMode: 'off' | 'even' | 'odd' = 'off';

  public zoom: number | string = 'auto';

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
}
