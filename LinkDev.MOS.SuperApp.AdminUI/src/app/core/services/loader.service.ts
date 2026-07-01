import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly progressSubject = new BehaviorSubject<number>(0);
  private navigationCount = 0;
  private overlayTimer: ReturnType<typeof setTimeout> | null = null;

  readonly loading$ = this.loadingSubject.asObservable();
  readonly progress$ = this.progressSubject.asObservable();
  readonly showOverlay$ = new BehaviorSubject<boolean>(false);

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  startNavigation(): void {
    this.navigationCount++;
    this.loadingSubject.next(true);
    this.progressSubject.next(30);

    if (this.overlayTimer) {
      clearTimeout(this.overlayTimer);
    }
    this.overlayTimer = setTimeout(() => {
      if (this.navigationCount > 0) {
        this.showOverlay$.next(true);
      }
    }, 350);
  }

  completeNavigation(): void {
    this.navigationCount = Math.max(0, this.navigationCount - 1);
    this.progressSubject.next(100);

    if (this.overlayTimer) {
      clearTimeout(this.overlayTimer);
      this.overlayTimer = null;
    }

    setTimeout(() => {
      if (this.navigationCount === 0) {
        this.loadingSubject.next(false);
        this.showOverlay$.next(false);
        this.progressSubject.next(0);
      }
    }, 280);
  }
}
