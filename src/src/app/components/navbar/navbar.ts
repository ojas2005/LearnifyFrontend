import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: false
})
export class Navbar implements OnInit {
  user: User | null = null;
  isDark = false;
  menuOpen = false;

  constructor(private router: Router, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(u => {
      this.user = u;
      this.cdr.detectChanges();
    });
    this.isDark = localStorage.getItem('theme') === 'dark';
  }

  navigate(page: string): void { this.router.navigate([page]); this.menuOpen = false; }

  logout(): void { this.auth.logout(); this.router.navigate(['/']); }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    const t = this.isDark ? 'dark' : 'light';
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
  }

  get dashRoute(): string {
    if (!this.user) return '/login';
    if (this.user.role === 'Admin' || this.user.role === 'Administrator') return '/admin';
    if (this.user.role === 'Instructor') return '/instructor';
    return '/dashboard';
  }
}
