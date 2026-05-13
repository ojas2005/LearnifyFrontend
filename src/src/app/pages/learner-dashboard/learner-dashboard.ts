import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-learner-dashboard',
  templateUrl: './learner-dashboard.html',
  styleUrls: ['./learner-dashboard.css'],
  standalone: false
})
export class LearnerDashboard implements OnInit {
  user: any;
  registrations: any[] = [];
  loading = true;

  constructor(
    public api: ApiService,
    public auth: AuthService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser;
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    
    // Fetch both registrations and all courses to ensure we have titles and instructor names
    forkJoin({
      regs: this.api.get<any[]>(`/api/registration/api/registrations/learner/${this.user.id}`, true),
      courses: this.api.get<any[]>('/api/courses/api/courses', true)
    }).subscribe({
      next: ({ regs, courses }) => {
        this.registrations = regs.map(r => {
          const courseDetail = courses.find(c => c.id === r.courseId);
          return {
            ...r,
            // Fallback to courseDetail if the registration service didn't include the title
            courseTitle: r.courseTitle || courseDetail?.title || 'Unknown Course',
            instructorName: courseDetail?.authorName || 'Expert Instructor',
            color: this.getRandomColor(r.courseId)
          };
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Dashboard Error:', err);
        this.loading = false;
      }
    });
  }

  private getRandomColor(id: number): string {
    const colors = ['#BEF264', '#A7F3D0', '#BAE6FD', '#FED7AA', '#FECDD3'];
    return colors[id % colors.length];
  }

  viewCourse(id: number): void {
    this.router.navigate(['/course', id]);
  }
}
