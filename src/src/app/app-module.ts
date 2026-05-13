import { NgModule }            from '@angular/core';
import { BrowserModule }       from '@angular/platform-browser';
import { FormsModule }         from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';
import { AppRoutingModule }    from './app-routing-module';

import { App }                 from './app';
import { Navbar }              from './components/navbar/navbar';
import { Toast }               from './components/toast/toast';
import { Landing }             from './pages/landing/landing';
import { Catalog }             from './pages/catalog/catalog';
import { CourseDetail }        from './pages/course-detail/course-detail';
import { Login }               from './pages/login/login';
import { Register }            from './pages/register/register';
import { LearnerDashboard }    from './pages/learner-dashboard/learner-dashboard';
import { InstructorDashboard } from './pages/instructor-dashboard/instructor-dashboard';
import { AdminDashboard }      from './pages/admin-dashboard/admin-dashboard';
import { Profile }             from './pages/profile/profile';
import { FilterPendingPipe }   from './pipes/filter-pending';

@NgModule({
  declarations: [
    App, Navbar, Toast,
    Landing, Catalog, CourseDetail,
    Login, Register,
    LearnerDashboard, InstructorDashboard, AdminDashboard, Profile,
    FilterPendingPipe
  ],
  imports: [BrowserModule, FormsModule, HttpClientModule, AppRoutingModule],
  bootstrap: [App]
})
export class AppModule {}
