import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<app-navbar></app-navbar><app-toast></app-toast><router-outlet></router-outlet>`,
  styles: [],
  standalone: false
})
export class App implements OnInit {
  ngOnInit(): void {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
  }
}
