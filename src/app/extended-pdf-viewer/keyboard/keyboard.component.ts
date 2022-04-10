import { Component, OnInit } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css'],
})
export class KeyboardComponent {
  public ignoreKeyboard = false;

  public acceptKeys: Array<string> = [];

  public ignoreKeys = ['j', 'k', 'F4'];

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.pdfService.recalculateSize());
  }

  private accept(key: string, add: boolean): void {
    if (add) {
      if (!this.acceptKeys.some((k) => k.toLowerCase() === key.toLowerCase())) {
        this.acceptKeys.push(key);
      }
    } else {
      this.acceptKeys = this.acceptKeys.filter((k) => !(k.toLowerCase() === key.toLowerCase()));
    }
  }
  private ignore(key: string, add: boolean): void {
    if (add) {
      if (!this.ignoreKeys.some((k) => k.toLowerCase() === key.toLowerCase())) {
        this.ignoreKeys.push(key);
      }
    } else {
      this.ignoreKeys = this.ignoreKeys.filter((k) => !(k.toLowerCase() === key.toLowerCase()));
    }
  }

  // tslint:disable:quotemark
  public get acceptKeysDisplay(): string {
    let result = '[';
    this.acceptKeys.forEach((key) => (result += "'" + key + "', "));
    if (result.endsWith(', ')) {
      result = result.substring(0, result.length - 2);
    }
    return result + ']';
  }

  public set acceptKeysDisplay(input: string) {
    if (input.length > 2 && input.startsWith('[')) {
      input = input.substring(1);
    }
    if (input.length > 2 && input.endsWith(']')) {
      input = input.substring(0, input.length - 1);
    }
    if (input.length === 1) {
      this.acceptKeys = [input];
    }
    const keys = input.split(',');
    this.acceptKeys = keys.map((keydefinition) => {
      if (keydefinition.startsWith('"')) {
        keydefinition = keydefinition.substring(1);
      }
      if (keydefinition.startsWith('"')) {
        keydefinition = keydefinition.substring(0, keydefinition.length - 1);
      }
      if (keydefinition.startsWith("'")) {
        keydefinition = keydefinition.substring(1);
      }
      if (keydefinition.startsWith("'")) {
        keydefinition = keydefinition.substring(0, keydefinition.length - 1);
      }
      return keydefinition;
    });
  }

  public get ignoreKeysDisplay(): string {
    let result = '[';
    this.ignoreKeys.forEach((key) => (result += "'" + key + "', "));
    if (result.endsWith(', ')) {
      result = result.substring(0, result.length - 2);
    }
    return result + ']';
  }

  public set ignoreKeysDisplay(input: string) {
    if (input.length > 2 && input.startsWith('[')) {
      input = input.substring(1);
    }
    if (input.length > 2 && input.endsWith(']')) {
      input = input.substring(0, input.length - 1);
    }
    if (input.length === 1) {
      this.ignoreKeys = [input];
    }
    const keys = input.split(',');
    this.ignoreKeys = keys.map((keydefinition) => {
      if (keydefinition.startsWith('"')) {
        keydefinition = keydefinition.substring(1);
      }
      if (keydefinition.startsWith('"')) {
        keydefinition = keydefinition.substring(0, keydefinition.length - 1);
      }
      if (keydefinition.startsWith("'")) {
        keydefinition = keydefinition.substring(1);
      }
      if (keydefinition.startsWith("'")) {
        keydefinition = keydefinition.substring(0, keydefinition.length - 1);
      }
      return keydefinition;
    });
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {}

  public set acceptCtrlF(v: boolean) {
    this.accept('CTRL+F', v);
  }

  public get acceptCtrlF() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'CTRL+F'.toLowerCase());
  }

  public set ignoreCtrlF(v: boolean) {
    this.ignore('CTRL+F', v);
  }

  public get ignoreCtrlF() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'CTRL+F'.toLowerCase());
  }
  public set acceptCtrlG(v: boolean) {
    this.accept('CTRL+G', v);
  }

  public get acceptCtrlG() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'CTRL+G'.toLowerCase());
  }

  public set ignoreCtrlG(v: boolean) {
    this.ignore('CTRL+G', v);
  }

  public get ignoreCtrlG() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'CTRL+G'.toLowerCase());
  }
  public set acceptCtrlPlus(v: boolean) {
    this.accept('CTRL++', v);
  }

  public get acceptCtrlPlus() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'CTRL++'.toLowerCase());
  }

  public set ignoreCtrlPlus(v: boolean) {
    this.ignore('CTRL++', v);
  }

  public get ignoreCtrlPlus() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'CTRL++'.toLowerCase());
  }

  public set acceptCtrlMinus(v: boolean) {
    this.accept('CTRL+-', v);
  }

  public get acceptCtrlMinus() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'CTRL+-'.toLowerCase());
  }

  public set ignoreCtrlMinus(v: boolean) {
    this.ignore('CTRL+-', v);
  }

  public get ignoreCtrlMinus() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'CTRL+-'.toLowerCase());
  }

  public set acceptCtrl0(v: boolean) {
    this.accept('CTRL+0', v);
  }

  public get acceptCtrl0() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'CTRL+0'.toLowerCase());
  }

  public set ignoreCtrl0(v: boolean) {
    this.ignore('CTRL+0', v);
  }

  public get ignoreCtrl0() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'CTRL+0'.toLowerCase());
  }

  public set acceptUp(v: boolean) {
    this.accept('CTRL+UP', v);
  }

  public get acceptUp() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'UP'.toLowerCase());
  }

  public set ignoreUp(v: boolean) {
    this.ignore('UP', v);
  }

  public get ignoreUp() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'UP'.toLowerCase());
  }

  public set acceptDown(v: boolean) {
    this.accept('DOWN', v);
  }

  public get acceptDown() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'DOWN'.toLowerCase());
  }

  public set ignoreDown(v: boolean) {
    this.ignore('DOWN', v);
  }

  public get ignoreDown() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'DOWN'.toLowerCase());
  }

  public set acceptCtrlUp(v: boolean) {
    this.accept('CTRL+UP', v);
  }

  public get acceptCtrlUp() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'CTRL+UP'.toLowerCase());
  }

  public set ignoreCtrlUp(v: boolean) {
    this.ignore('CTRL+UP', v);
  }

  public get ignoreCtrlUp() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'CTRL+UP'.toLowerCase());
  }

  public set acceptCtrlDown(v: boolean) {
    this.accept('CTRL+DOWN', v);
  }

  public get acceptCtrlDown() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'CTRL+DOWN'.toLowerCase());
  }

  public set ignoreCtrlDown(v: boolean) {
    this.ignore('CTRL+DOWN', v);
  }

  public get ignoreCtrlDown() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'CTRL+DOWN'.toLowerCase());
  }

  public set acceptP(v: boolean) {
    this.accept('P', v);
  }

  public get acceptP() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'P'.toLowerCase());
  }

  public set ignoreP(v: boolean) {
    this.ignore('P', v);
  }

  public get ignoreP() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'P'.toLowerCase());
  }

  public set acceptK(v: boolean) {
    this.accept('K', v);
  }

  public get acceptK() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'K'.toLowerCase());
  }

  public set ignoreK(v: boolean) {
    this.ignore('K', v);
  }

  public get ignoreK() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'K'.toLowerCase());
  }

  public set acceptJ(v: boolean) {
    this.accept('J', v);
  }

  public get acceptJ() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'J'.toLowerCase());
  }

  public set ignoreJ(v: boolean) {
    this.ignore('J', v);
  }

  public get ignoreJ() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'J'.toLowerCase());
  }

  public set acceptN(v: boolean) {
    this.accept('N', v);
  }

  public get acceptN() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'N'.toLowerCase());
  }

  public set ignoreN(v: boolean) {
    this.ignore('N', v);
  }

  public get ignoreN() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'N'.toLowerCase());
  }

  public set acceptHome(v: boolean) {
    this.accept('HOME', v);
  }

  public get acceptHome() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'HOME'.toLowerCase());
  }

  public set ignoreHome(v: boolean) {
    this.ignore('HOME', v);
  }

  public get ignoreHome() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'HOME'.toLowerCase());
  }

  public set acceptEnd(v: boolean) {
    this.accept('END', v);
  }

  public get acceptEnd() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'END'.toLowerCase());
  }

  public set ignoreEnd(v: boolean) {
    this.ignore('END', v);
  }

  public get ignoreEnd() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'END'.toLowerCase());
  }

  public set acceptS(v: boolean) {
    this.accept('S', v);
  }

  public get acceptS() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'S'.toLowerCase());
  }

  public set ignoreS(v: boolean) {
    this.ignore('S', v);
  }

  public get ignoreS() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'S'.toLowerCase());
  }

  public set acceptCtrlS(v: boolean) {
    this.accept('CTRL+S', v);
  }

  public get acceptCtrlS() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'CTRL+S'.toLowerCase());
  }

  public set ignoreCtrlS(v: boolean) {
    this.ignore('CTRL+S', v);
  }

  public get ignoreCtrlS() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'CTRL+S'.toLowerCase());
  }

  public set acceptH(v: boolean) {
    this.accept('H', v);
  }

  public get acceptH() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'H'.toLowerCase());
  }

  public set ignoreH(v: boolean) {
    this.ignore('H', v);
  }

  public get ignoreH() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'H'.toLowerCase());
  }

  public set acceptR(v: boolean) {
    this.accept('R', v);
  }

  public get acceptR() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'R'.toLowerCase());
  }

  public set ignoreR(v: boolean) {
    this.ignore('R', v);
  }

  public get ignoreR() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'R'.toLowerCase());
  }

  public set acceptShiftR(v: boolean) {
    this.accept('Shift+R', v);
  }

  public get acceptShiftR() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'Shift+R'.toLowerCase());
  }

  public set ignoreShiftR(v: boolean) {
    this.ignore('Shift+R', v);
  }

  public get ignoreShiftR() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'Shift+R'.toLowerCase());
  }

  public set acceptCtrlAltP(v: boolean) {
    this.accept('Ctrl+Alt+P', v);
  }

  public get acceptCtrlAltP() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'Ctrl+Alt+P'.toLowerCase());
  }

  public set ignoreCtrlAltP(v: boolean) {
    this.ignore('Ctrl+Alt+P', v);
  }

  public get ignoreCtrlAltP() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'Ctrl+Alt+P'.toLowerCase());
  }

  public set acceptF4(v: boolean) {
    this.accept('F4', v);
  }

  public get acceptF4() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'F4'.toLowerCase());
  }

  public set ignoreF4(v: boolean) {
    this.ignore('F4', v);
  }

  public get ignoreF4() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'F4'.toLowerCase());
  }

  public set acceptAltCtrlG(v: boolean) {
    this.accept('Alt+Ctrl+G', v);
  }

  public get acceptAltCtrlG() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'Alt+Ctrl+G'.toLowerCase());
  }

  public set ignoreAltCtrlG(v: boolean) {
    this.ignore('Alt+Ctrl+G', v);
  }

  public get ignoreAltCtrlG() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'Ctrl+WHEEL'.toLowerCase());
  }

  public set acceptCtrlWheel(v: boolean) {
    this.accept('Ctrl+WHEEL', v);
  }

  public get acceptCtrlWheel() {
    return this.acceptKeys.some((k) => k.toLowerCase() === 'Ctrl+WHEEL'.toLowerCase());
  }

  public set ignoreCtrlWheel(v: boolean) {
    this.ignore('Ctrl+WHEEL', v);
  }

  public get ignoreCtrlWheel() {
    return this.ignoreKeys.some((k) => k.toLowerCase() === 'Ctrl+WHEEL'.toLowerCase());
  }

  public get sourcecode(): string {
    return `<ngx-extended-pdf-viewer
    [src]="'/assets/pdfs/hammond-organ-wikipedia.pdf'"
    [ignoreKeyboard]="${this.ignoreKeyboard}"
    [ignoreKeys]="${this.ignoreKeysDisplay}"
    [acceptKeys]="${this.acceptKeysDisplay}"
    backgroundColor="#ffffff"
    [height]="'90vh'"
    [useBrowserLocale]="true"
    [page]="2"
    showPresentationModeButton="true"
>
  </ngx-extended-pdf-viewer>`;
  }
}
