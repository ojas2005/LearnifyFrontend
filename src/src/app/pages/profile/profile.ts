import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: false
})
export class Profile implements OnInit {
  user: any;
  loading = false;
  
  form = { displayName: '', profilePictureUrl: '' };
  passForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser;
    if (this.user) {
      this.form.displayName = this.user.displayName;
      this.form.profilePictureUrl = this.user.profilePictureUrl || '';
    }
  }

  updateProfile(): void {
    if (!this.form.displayName) return;
    
    console.log('Profile: Starting update...', this.form);
    this.loading = true;
    
    this.api.patch<any>('/api/identity/api/accounts/me/profile', this.form).subscribe({
      next: (updated) => {
        console.log('Profile: Received updated data:', updated);
        try {
          // Merge with existing user data to preserve token and other fields
          const newUser = { ...this.user, ...updated };
          console.log('Profile: Logging in with merged user:', newUser);
          this.auth.login(newUser);
          this.user = newUser; // Update local reference too
          this.toast.add('Profile updated successfully! ✨', 'success');
        } catch (e) {
          console.error('Profile: Error updating local state:', e);
          this.toast.add('Profile saved, but UI update failed. Please refresh.', 'info');
        } finally {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Profile: API Error:', err);
        this.toast.add(err.message || 'Failed to update profile', 'error');
        this.loading = false;
      }
    });
  }

  changePassword(): void {
    if (this.passForm.newPassword !== this.passForm.confirmPassword) {
      this.toast.add('Passwords do not match', 'error');
      return;
    }

    this.loading = true;
    this.api.patch('/api/identity/api/accounts/me/password', {
      currentPassword: this.passForm.currentPassword,
      newPassword: this.passForm.newPassword
    }).subscribe({
      next: () => {
        this.toast.add('Password changed successfully! 🔐', 'success');
        this.passForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.loading = false;
      },
      error: (err) => {
        this.toast.add(err.message, 'error');
        this.loading = false;
      }
    });
  }
}
