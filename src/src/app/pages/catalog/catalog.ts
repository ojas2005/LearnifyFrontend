import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.html',
  styleUrls: ['./catalog.css'],
  standalone: false
})
export class Catalog implements OnInit {
  courses: any[] = [];
  filteredCourses: any[] = [];
  loading = true;
  searchTerm = '';
  activeTopic = 'All';
  activeDifficulty: number | null = null;

  topics = [
    { name: 'All', icon: '🌈', color: '#84CC16' },
    { name: 'Programming', icon: '💻', color: '#10B981' },
    { name: 'Design', icon: '🎨', color: '#F59E0B' },
    { name: 'Business', icon: '📈', color: '#EF4444' },
    { name: 'Marketing', icon: '📣', color: '#3B82F6' },
    { name: 'Health', icon: '🧘', color: '#EC4899' }
  ];

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.api.get<any[]>('/api/courses/api/courses').subscribe({
      next: (data) => {
        this.courses = data.map(c => ({
          ...c,
          emoji: this.topics.find(t => t.name === c.topic)?.icon || '📚',
          color: this.topics.find(t => t.name === c.topic)?.color || '#84CC16'
        }));
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredCourses = this.courses.filter(c => {
      const matchTopic = this.activeTopic === 'All' || c.topic === this.activeTopic;
      const matchDiff = this.activeDifficulty === null || c.difficulty === this.activeDifficulty;
      const matchSearch = c.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchTopic && matchDiff && matchSearch;
    });
  }

  setTopic(t: string): void {
    this.activeTopic = t;
    this.applyFilters();
  }

  setDifficulty(d: number | null): void {
    this.activeDifficulty = d;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  viewCourse(id: number): void {
    this.router.navigate(['/course', id]);
  }
}
