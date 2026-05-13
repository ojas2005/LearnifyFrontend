import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage { id: number; message: string; type: 'success' | 'error' | 'info'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = new BehaviorSubject<ToastMessage[]>([]);
  toasts$ = this._toasts.asObservable();
  private next = 0;

  add(message: string, type: ToastMessage['type'] = 'info'): void {
    const id = this.next++;
    this._toasts.next([...this._toasts.value, { id, message, type }]);
    setTimeout(() => this.remove(id), 3500);
  }

  remove(id: number): void {
    this._toasts.next(this._toasts.value.filter(t => t.id !== id));
  }
}
