import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
  standalone: false
})
export class Landing implements OnInit {
  featuredCourses: any[] = [];
  loading = true;

  constructor(public api: ApiService, public router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.api.get<any[]>('/api/courses/api/courses').subscribe({
      next: (data) => {
        this.featuredCourses = data.slice(0, 4).map(c => ({
          ...c,
          emoji: ['💻', '🎨', '📈', '📣', '🧘'][Math.floor(Math.random() * 5)], // Fallback mapping
          color: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'][Math.floor(Math.random() * 5)]
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  viewCourse(id: number): void {
    this.router.navigate(['/course', id]);
  }
}
