import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  public logs: Array<string> = [];

  constructor() {
    Window['ngxConsoleFilter'] = (level: string, message: any): boolean => {
      if (message === 'simple') {
      }
      this.logs.push(message);
      return true;
    }
  }
}
