import { Component } from '@angular/core';
import { ApiService } from '../../services/api';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: false
})
export class Register {
  form = { name: '', email: '', password: '', role: 'Learner' };
  loading = false;

  constructor(
    public api: ApiService,
    public toast: ToastService,
    public router: Router
  ) {}

  submit(): void {
    if (!this.form.name || !this.form.email || !this.form.password) {
      this.toast.add('Please fill in all fields', 'error');
      return;
    }

    this.loading = true;
    this.api.post<any>('/api/identity/api/accounts/register', {
      displayName: this.form.name,
      email: this.form.email,
      password: this.form.password,
      role: this.form.role === 'Learner' ? 0 : 1 // 0=Learner, 1=Instructor
    }).subscribe({
      next: (res) => {
        if (this.form.role === 'Instructor') {
          this.toast.add('Request submitted. You can sign in once admin approves.', 'success');
        } else {
          this.toast.add('Account created! You can now sign in.', 'success');
        }
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.toast.add(err.message, 'error');
        this.loading = false;
      }
    });
  }

  setRole(r: string): void {
    this.form.role = r;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
