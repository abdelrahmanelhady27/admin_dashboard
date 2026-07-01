export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  messageKey: string;
  params?: Record<string, string | number>;
  duration?: number;
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  show(type: ToastType, messageKey: string, params?: Record<string, string | number>, duration = 4000): void {
    const toast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      messageKey,
      params,
      duration
    };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    setTimeout(() => this.remove(toast.id), duration);
  }

  success(messageKey: string, params?: Record<string, string | number>): void {
    this.show('success', messageKey, params);
  }

  error(messageKey: string, params?: Record<string, string | number>): void {
    this.show('error', messageKey, params);
  }

  warning(messageKey: string, params?: Record<string, string | number>): void {
    this.show('warning', messageKey, params);
  }

  info(messageKey: string, params?: Record<string, string | number>): void {
    this.show('info', messageKey, params);
  }

  remove(id: string): void {
    this.toastsSubject.next(this.toastsSubject.value.filter((t) => t.id !== id));
  }
}
