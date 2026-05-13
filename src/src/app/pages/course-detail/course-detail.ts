import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.html',
  styleUrls: ['./course-detail.css'],
  standalone: false
})
export class CourseDetail implements OnInit {
  course: any = null;
  loading = true;
  enrolled = false;
  activeLesson: any = null;
  lessons: any[] = [];
  reviews: any[] = [];
  activeTab = 'curriculum';

  constructor(
    public route: ActivatedRoute,
    public api: ApiService,
    public auth: AuthService,
    public toast: ToastService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.api.get<any>(`/api/courses/api/courses/${id}`).subscribe({
      next: (data) => {
        this.course = data;
        this.checkEnrollment();
        this.fetchLessons();
        this.fetchReviews();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.add('Course not found', 'error');
        this.router.navigate(['/catalog']);
      }
    });
  }

  checkEnrollment(): void {
    const user = this.auth.currentUser;
    if (!user) return;
    
    this.api.get<any[]>(`/api/registration/api/registrations/learner/${user.id}`).subscribe(regs => {
      this.enrolled = regs.some(r => r.courseId === this.course.id);
      this.cdr.detectChanges();
    });
  }

  fetchLessons(): void {
    this.api.get<any[]>(`/api/curriculum/api/curriculum/course/${this.course.id}`).subscribe({
      next: (data) => {
        this.lessons = data;
        this.activeLesson = data[0];
        this.loading = false;
      },
      error: (err) => {
        console.error('Lessons Error:', err);
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  enroll(): void {
    const user = this.auth.currentUser;
    if (!user) {
      this.toast.add('Please sign in to enroll', 'info');
      this.router.navigate(['/login']);
      return;
    }

    this.api.post('/api/registration/api/registrations', { courseId: this.course.id }).subscribe({
      next: () => {
        this.toast.add('Enrollment successful! 🎉', 'success');
        this.enrolled = true;
      },
      error: (err) => this.toast.add(err.message, 'error')
    });
  }

  fetchReviews(): void {
    this.api.get<any[]>('/api/reviews/api/reviews/course/' + this.course.id, true).subscribe({
      next: (data) => {
        this.reviews = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Reviews Error:', err)
    });
  }
}
