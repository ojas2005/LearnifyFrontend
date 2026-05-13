import { Component, OnInit } from '@angular/core';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrls: ['./toast.css'],
  standalone: false
})
export class Toast implements OnInit {
  toasts: ToastMessage[] = [];
  constructor(private toastSvc: ToastService) {}
  ngOnInit(): void { this.toastSvc.toasts$.subscribe(t => this.toasts = t); }
  dismiss(id: number): void { this.toastSvc.remove(id); }
}
