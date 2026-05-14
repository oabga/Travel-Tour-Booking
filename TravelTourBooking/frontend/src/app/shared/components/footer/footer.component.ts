import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-dark text-white-50 py-4 mt-5">
      <div class="container text-center">
        <p class="mb-1">
          <i class="bi bi-globe-americas me-1"></i>
          Travel Tour Booking &copy; {{ year }}
        </p>
        <small>Do an mon Lap trinh Co so Du lieu — Angular 17 + ASP.NET Core</small>
      </div>
    </footer>
  `
})
export class FooterComponent {
  year = new Date().getFullYear();
}
