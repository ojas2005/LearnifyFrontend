import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: number;
  displayName: string;
  email: string;
  role: string;
  profilePictureUrl?: string;
  accessToken?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = new BehaviorSubject<User | null>(this.loadUser());
  user$ = this._user.asObservable();

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem('learnify_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  get currentUser(): User | null { return this._user.value; }
  get token(): string | null { return this._user.value?.accessToken ?? null; }
  get isLoggedIn(): boolean { return !!this._user.value; }

  login(user: User): void {
    localStorage.setItem('learnify_user', JSON.stringify(user));
    this._user.next(user);
  }

  logout(): void {
    localStorage.removeItem('learnify_user');
    this._user.next(null);
  }
}
