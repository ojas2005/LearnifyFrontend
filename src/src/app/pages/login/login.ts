import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: false
})
export class Login {
  form = { email: '', password: '' };
  loading = false;
  gatewayUrl = 'https://learnify-gateway-ojas2005-dev.apps.rm2.thpm.p1.openshiftapps.com';

  constructor(
    public api: ApiService,
    public auth: AuthService,
    public toast: ToastService,
    public router: Router
  ) {}

  submit(): void {
    if (!this.form.email || !this.form.password) {
      this.toast.add('Please fill in all fields', 'error');
      return;
    }

    this.loading = true;
    this.api.post<any>('/api/identity/api/accounts/login', {
      email: this.form.email,
      password: this.form.password
    }).subscribe({
      next: (loginRes) => {
        const token = loginRes.accessToken;
        
        // Create headers manually for the /me call since auth service doesn't have the token yet
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });

        // Fetch profile using the token explicitly
        this.api.get<any>('/api/identity/api/accounts/me', false).subscribe({
          next: (profile) => {
            this.auth.login({ ...profile, accessToken: token });
            this.toast.add(`Welcome back, ${profile.displayName}!`, 'success');
            
            const role = profile.role;
            if (role === 'Administrator') this.router.navigate(['/admin']);
            else if (role === 'Instructor') this.router.navigate(['/instructor']);
            else this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.toast.add('Failed to fetch profile', 'error');
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.toast.add(err.message, 'error');
        this.loading = false;
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
