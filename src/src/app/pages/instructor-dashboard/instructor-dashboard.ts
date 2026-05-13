import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-instructor-dashboard',
  templateUrl: './instructor-dashboard.html',
  styleUrls: ['./instructor-dashboard.css'],
  standalone: false
})
export class InstructorDashboard implements OnInit {
  myCourses: any[] = [];
  loading = true;
  showCreateModal = false;
  showEditModal = false;
  form = { title: '', synopsis: '', topic: 'Programming', difficulty: 0, price: '' };
  editForm: any = {};
  editingCourse: any = null;
  
  showRosterModal = false;
  selectedRoster: any[] = [];
  rosterLoading = false;
  selectedCourseForRoster: any = null;
  allAccounts: any[] = []; // Store accounts to map student names

  topics = ['Programming', 'Design', 'Business', 'Marketing', 'Health'];

  constructor(
    public api: ApiService,
    public auth: AuthService,
    public toast: ToastService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (!user || user.role !== 'Instructor') {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    
    // Fetch courses and accounts in parallel to ensure we have name mapping
    forkJoin({
      courses: this.api.get<any[]>('/api/courses/api/courses/my-courses', true),
      accounts: this.api.get<any[]>('/api/identity/api/accounts/search?term=@', true).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ courses, accounts }) => {
        this.allAccounts = accounts;
        
        if (courses.length === 0) {
          this.myCourses = [];
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        const headcountRequests = courses.map(c => 
          this.api.get<any>(`/api/registration/api/registrations/course/${c.id}/headcount`, true).pipe(
            catchError(() => of({ count: 0 }))
          )
        );

        forkJoin(headcountRequests).subscribe({
          next: (counts) => {
            setTimeout(() => {
              this.myCourses = courses.map((c, i) => ({
                ...c,
                totalRegistrations: counts[i].count ?? c.totalRegistrations ?? 0
              }));
              this.loading = false;
              this.cdr.detectChanges();
            });
          }
        });
      },
      error: (err) => {
        this.toast.add(err.message, 'error');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  create(): void {
    const payload = { ...this.form, listPrice: parseFloat(this.form.price) || 0 };
    this.api.post('/api/courses/api/courses', payload).subscribe({
      next: () => {
        this.toast.add('Course created! 🚀', 'success');
        this.showCreateModal = false;
        this.form = { title: '', synopsis: '', topic: 'Programming', difficulty: 0, price: '' };
        this.refresh();
      },
      error: (err) => this.toast.add(err.message, 'error')
    });
  }

  openEdit(c: any): void {
    this.editingCourse = c;
    this.editForm = { ...c, price: c.listPrice };
    this.showEditModal = true;
  }

  saveEdit(): void {
    const payload = { ...this.editForm, listPrice: parseFloat(this.editForm.price) || 0 };
    this.api.put(`/api/courses/api/courses/${this.editingCourse.id}`, payload).subscribe({
      next: () => {
        this.toast.add('Changes saved ✓', 'success');
        this.showEditModal = false;
        this.refresh();
      },
      error: (err) => this.toast.add(err.message, 'error')
    });
  }

  delete(c: any): void {
    if (!confirm(`Are you sure you want to delete "${c.title}"?`)) return;
    this.api.delete(`/api/courses/api/courses/${c.id}`).subscribe({
      next: () => { this.refresh(); },
      error: (err) => this.toast.add(err.message, 'error')
    });
  }

  submit(c: any): void {
    this.api.post(`/api/courses/api/courses/${c.id}/submit-for-review`).subscribe({
      next: () => { this.toast.add('Submitted!', 'success'); this.refresh(); },
      error: (err) => this.toast.add(err.message, 'error')
    });
  }

  viewRoster(c: any): void {
    this.selectedCourseForRoster = c;
    this.showRosterModal = true;
    this.rosterLoading = true;
    this.selectedRoster = [];

    this.api.get<any[]>(`/api/registration/api/registrations/course/${c.id}/roster`).subscribe({
      next: (data) => {
        setTimeout(() => {
          this.selectedRoster = data.map(r => {
            const account = this.allAccounts.find(a => a.id === r.learnerId);
            return {
              ...r,
              // Map the student name from the Identity service data if missing from registration service
              learnerName: r.learnerName || account?.displayName || 'Student #' + r.learnerId
            };
          });
          this.rosterLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.toast.add('Failed to fetch roster', 'error');
        this.rosterLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getTotalStudents(): number {
    return this.myCourses.reduce((acc, c) => acc + (c.totalRegistrations || 0), 0);
  }

  getTotalRevenue(): number {
    return this.myCourses.reduce((acc, c) => acc + ((c.listPrice || 0) * (c.totalRegistrations || 0)), 0);
  }
}
