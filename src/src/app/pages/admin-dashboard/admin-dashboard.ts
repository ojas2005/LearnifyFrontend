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
  activeTab = 'users'; // Default to users view
  selectedUser: any = null;
  selectedCourse: any = null;
  enrollments: any[] = [];

  get pendingInstructors(): any[] {
    return this.accounts.filter(acc => acc.role === 'Instructor' && !acc.isActive);
  }

  get totalRevenue(): number {
    if (this.stats?.totalRevenue > 0) return this.stats.totalRevenue;
    // Local calculation fallback
    return this.courses.reduce((sum, c) => sum + (c.enrollmentCount || 0) * (c.listPrice || 0), 0);
  }

  constructor(
    public api: ApiService,
    public auth: AuthService,
    public toast: ToastService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (!user || (user.role !== 'Admin' && user.role !== 'Administrator')) {
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

    this.api.get<any>('/api/analytics/api/admin/analytics/dashboard', true).subscribe({
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

  updateRole(acc: any, role: string): void {
    const roleId = role === 'Instructor' ? 1 : role === 'Admin' ? 2 : 0;
    this.api.put(`/api/identity/api/accounts/${acc.id}/role`, { role: roleId }).subscribe({
      next: () => {
        this.toast.add(`Role updated for ${acc.displayName}.`, 'success');
        this.refresh();
      },
      error: (err) => this.toast.add(err.message, 'error')
    });
  }

  suspendUser(acc: any): void {
    this.api.post(`/api/identity/api/accounts/${acc.id}/suspend`).subscribe({
      next: () => {
        this.toast.add(`${acc.displayName} has been suspended.`, 'info');
        this.refresh();
      },
      error: (err) => this.toast.add(err.message, 'error')
    });
  }

  activateUser(acc: any): void {
    this.api.post(`/api/identity/api/accounts/${acc.id}/reactivate`).subscribe({
      next: () => {
        this.toast.add(`${acc.displayName} is now active.`, 'success');
        this.refresh();
      },
      error: (err) => this.toast.add(err.message, 'error')
    });
  }

  deleteCourse(c: any): void {
    if (!confirm(`Are you sure you want to delete "${c.title}"?`)) return;
    this.api.delete(`/api/courses/api/courses/${c.id}`).subscribe({
      next: () => {
        this.toast.add(`Course "${c.title}" deleted.`, 'success');
        this.refresh();
      },
      error: (err) => this.toast.add(err.message, 'error')
    });
  }

  inspectCourse(c: any): void {
    this.selectedCourse = c;
    this.activeTab = 'inspect-course';
    this.api.get<any[]>(`/api/registration/api/registrations/course/${c.id}/roster`, true).subscribe({
      next: (data) => {
        this.enrollments = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch enrollments', err);
        this.enrollments = [];
        this.cdr.detectChanges();
      }
    });
  }
}
