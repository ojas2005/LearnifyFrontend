import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './services/auth';
import { ApiService } from './services/api';
import { ToastService } from './services/toast.service';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: `<app-navbar></app-navbar><app-toast></app-toast><router-outlet></router-outlet>`,
  styles: [],
  standalone: false
})
export class App implements OnInit {
  constructor(
    private router: Router,
    private auth: AuthService,
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);

    this.handleOAuthCallback();
  }

  private handleOAuthCallback(): void {
    const hash = window.location.hash;
    if (hash.startsWith('#login-success')) {
      console.log('OAuth Callback detected, processing token...');
      const urlParams = new URLSearchParams(hash.split('?')[1]);
      const token = urlParams.get('token');

      if (token) {
        // Clear the hash from URL without reloading
        window.history.replaceState({}, document.title, window.location.pathname);

        // Fetch user profile using the new token
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });

        // Use raw http to ensure headers are sent before AuthService is updated
        this.api.http.get<any>('/backend/api/identity/api/accounts/me', { headers }).subscribe({
          next: (profile) => {
            this.auth.login({ ...profile, accessToken: token });
            this.toast.add(`Welcome, ${profile.displayName}!`, 'success');
            
            // Redirect based on role
            const role = profile.role;
            if (role === 'Administrator') this.router.navigate(['/admin']);
            else if (role === 'Instructor') this.router.navigate(['/instructor']);
            else this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Failed to fetch profile after OAuth:', err);
            this.toast.add('Login failed. Please try again.', 'error');
            this.router.navigate(['/login']);
          }
        });
      }
    }
  }
}
