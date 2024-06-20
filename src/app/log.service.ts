import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { WindowRefService } from './window-ref.servce';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  public logs: Array<string> = [];

  constructor(@Inject(PLATFORM_ID) private platformId: any, private windowRefService: WindowRefService) {
  }

  public init() {
    if (this.windowRefService.nativeWindow) {
      this.windowRefService.nativeWindow['ngxConsoleFilter'] = (level: string, message: any): boolean => {
        this.logs.push(message);
        return true;
      };
    }
  }
}
