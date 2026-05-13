import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
  standalone: false
})
export class AdminDashboard implements OnInit {
  accounts: any[] = [];
  courses: any[] = [];
  stats: any = null;
  loading = true;
  activeTab = 'pending';

  constructor(
    public api: ApiService,
    public auth: AuthService,
    public toast: ToastService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (!user || user.role !== 'Admin') {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.api.get<any[]>('/api/identity/api/accounts/search?term=@', true).subscribe({
      next: (data) => {
        this.accounts = data;
        this.cdr.detectChanges();
      },
      error: (err) => this.toast.add(err.message, 'error')
    });

    this.api.get<any[]>('/api/courses/api/courses/admin/all', true).subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.add(err.message, 'error');
        this.loading = false;
      }
    });

    this.api.get<any>('/api/analytics/api/analytics/platform-stats', true).subscribe({
      next: (data) => {
        this.stats = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Analytics Error:', err)
    });
  }

  approveCourse(c: any): void {
    this.api.post(`/api/courses/api/courses/${c.id}/approve`).subscribe({
      next: () => {
        this.toast.add(`Course "${c.title}" approved!`, 'success');
        this.refresh();
      },
      error: (err) => this.toast.add(err.message, 'error')
    });
  }

  rejectCourse(c: any): void {
    this.api.post(`/api/courses/api/courses/${c.id}/reject`).subscribe({
      next: () => {
        this.toast.add(`Course "${c.title}" rejected.`, 'info');
        this.refresh();
      },
      error: (err) => this.toast.add(err.message, 'error')
    });
  }

  updateRole(acc: any, role: number): void {
    this.api.put(`/api/identity/api/accounts/${acc.id}/role`, { role }).subscribe({
      next: () => {
        this.toast.add(`Role updated for ${acc.displayName}.`, 'success');
        this.refresh();
      },
      error: (err) => this.toast.add(err.message, 'error')
    });
  }
}
