import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { CommonModule } from '@angular/common';
import { SITE_NAME } from '../../app.config';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  menuOpen: boolean = false;
  isAuthenticated: boolean = false;
  userRole: string | null = null;

  routes: any[] = [];

  constructor(private authService: AuthService, private router: Router){}

  ngOnInit() : void {
    this.authService.authenticated$.subscribe((authenticated: boolean) => {
      this.isAuthenticated = authenticated;

      if (!authenticated) {
        const currentRoute = this.router.url;

        this.routes.forEach((route) => {
          if (route.routerLink === currentRoute && !route.show()) {
            this.router.navigate(['/']);
          }
        })
      }
    });

    this.authService.userRole$.subscribe((role) => {
      this.userRole = role;
    });

    this.routes = [
      { name: '🏠 Home', routerLink: '/' },
      { name: '🔐 Login', routerLink: '/login', show: () => !this.isAuthenticated },
      { name: '📝 Register', routerLink: '/register', show: () => !this.isAuthenticated },
      { name: '➕ New item', routerLink: '/new-item', show: () => this.isAuthenticated },
      { name: '📦 My items', routerLink: '/my-items', show: () => this.isAuthenticated },
      { name: '👤 My profile', routerLink: '/my-profile', show: () => this.isAuthenticated },
      { name: '🚪 Logout', click: () => this.logout(), show: () => this.isAuthenticated }
    ];
  }

  shopName: string = SITE_NAME;

  logout() : void {
    this.authService.logout();
  }
}
