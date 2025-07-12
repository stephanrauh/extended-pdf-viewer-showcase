import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FullscreenService {
  private _isFullscreen = new BehaviorSubject<boolean>(false);

  public readonly isFullscreen$: Observable<boolean> = this._isFullscreen.asObservable();

  public get isFullscreen(): boolean {
    return this._isFullscreen.value;
  }

  public toggleFullscreen(): void {
    this.setFullscreen(!this._isFullscreen.value);
  }

  public setFullscreen(fullscreen: boolean): void {
    this._isFullscreen.next(fullscreen);
  }

  public enterFullscreen(): void {
    this.setFullscreen(true);
  }

  public exitFullscreen(): void {
    this.setFullscreen(false);
  }
}