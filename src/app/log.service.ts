import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { WindowRefService } from './window-ref.servce';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  public logs: Array<string> = [];

  constructor(@Inject(PLATFORM_ID) private platformId: any, private windowRefService: WindowRefService) {
    if (windowRefService.nativeWindow) {
      windowRefService.nativeWindow['ngxConsoleFilter'] = (level: string, message: any): boolean => {
        if (message === 'simple') {
        }
        this.logs.push(message);
        return true;
      };
    }
  }
}
