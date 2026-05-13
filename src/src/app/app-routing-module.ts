import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Landing }               from './pages/landing/landing';
import { Catalog }               from './pages/catalog/catalog';
import { CourseDetail }          from './pages/course-detail/course-detail';
import { Login }                 from './pages/login/login';
import { Register }              from './pages/register/register';
import { LearnerDashboard }      from './pages/learner-dashboard/learner-dashboard';
import { InstructorDashboard }   from './pages/instructor-dashboard/instructor-dashboard';
import { AdminDashboard }        from './pages/admin-dashboard/admin-dashboard';
import { Profile }               from './pages/profile/profile';

const routes: Routes = [
  { path: '',              component: Landing },
  { path: 'catalog',       component: Catalog },
  { path: 'course/:id',    component: CourseDetail },
  { path: 'login',         component: Login },
  { path: 'register',      component: Register },
  { path: 'dashboard',     component: LearnerDashboard },
  { path: 'instructor',    component: InstructorDashboard },
  { path: 'admin',         component: AdminDashboard },
  { path: 'profile',       component: Profile },
  { path: '**',            redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
