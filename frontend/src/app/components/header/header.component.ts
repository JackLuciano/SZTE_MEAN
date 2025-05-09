import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
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

  constructor(private authService: AuthService){}

  ngOnInit() : void {
    this.authService.authenticated$.subscribe((authenticated: boolean) => {
      this.isAuthenticated = authenticated;
    });

    this.authService.userRole$.subscribe((role) => {
      this.userRole = role;
    });

    this.routes = [
      { name: '🏠 Home', routerLink: '/' },
      { name: '🔐 Login', routerLink: '/login', show: () => !this.isAuthenticated },
      { name: '📝 Register', routerLink: '/register', show: () => !this.isAuthenticated },
      { name: '➕ New sale', show: () => this.isAuthenticated },
      { name: '📦 My items', show: () => this.isAuthenticated },
      { name: '👤 My profile', show: () => this.isAuthenticated },
      { name: '🚪 Logout', click: () => this.logout(), show: () => this.isAuthenticated }
    ];
  }

  shopName: string = SITE_NAME;

  logout() : void {
    this.authService.logout();
  }
}
