import { Injectable } from '@angular/core';

const originalConsoleLog = console.log;

@Injectable({
  providedIn: 'root'
})
export class LogService {


  public logs: Array<string> = [];

  constructor() {
    console.log = (s) => { this.logs.push(s); originalConsoleLog(s); }
    console.error = (s) => { this.logs.push(s); originalConsoleLog(s); }

  }
}
