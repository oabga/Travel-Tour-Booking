import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/tours/tour-list/tour-list.component')
      .then(m => m.TourListComponent)
  },
  {
    path: 'tours',
    loadComponent: () => import('./features/tours/tour-list/tour-list.component')
      .then(m => m.TourListComponent)
  },
  {
    path: 'tours/search',
    loadComponent: () => import('./features/tours/tour-search/tour-search.component')
      .then(m => m.TourSearchComponent)
  },
  {
    path: 'tours/:id',
    loadComponent: () => import('./features/tours/tour-detail/tour-detail.component')
      .then(m => m.TourDetailComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'bookings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/bookings/booking-history/booking-history.component')
      .then(m => m.BookingHistoryComponent)
  },
  {
    path: 'bookings/new/:scheduleId',
    canActivate: [roleGuard(['Customer'])],
    loadComponent: () => import('./features/bookings/booking-form/booking-form.component')
      .then(m => m.BookingFormComponent)
  },
  {
    path: 'bookings/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/bookings/booking-detail/booking-detail.component')
      .then(m => m.BookingDetailComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component')
      .then(m => m.ProfileComponent)
  },
  {
    path: 'admin',
    canActivate: [roleGuard(['Admin'])],
    loadComponent: () => import('./features/admin/admin-layout.component')
      .then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'tours',
        loadComponent: () => import('./features/admin/tour-manage/tour-manage.component')
          .then(m => m.TourManageComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/category-manage/category-manage.component')
          .then(m => m.CategoryManageComponent)
      },
      {
        path: 'destinations',
        loadComponent: () => import('./features/admin/destination-manage/destination-manage.component')
          .then(m => m.DestinationManageComponent)
      },
      {
        path: 'schedules',
        loadComponent: () => import('./features/admin/schedule-manage/schedule-manage.component')
          .then(m => m.ScheduleManageComponent)
      },
      {
        path: 'employees',
        loadComponent: () => import('./features/admin/employee-manage/employee-manage.component')
          .then(m => m.EmployeeManageComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/admin/reports/reports.component')
          .then(m => m.ReportsComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
