import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { CommonModule } from '@angular/common';
import { SITE_NAME } from '../../app.config';
import { User } from '../models/user';
import { InfoboxUtil } from '../../utilts/infobox-util';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  menuOpen: boolean = false;
  isAuthenticated: boolean = false;
  user: User | null = null;

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

    this.authService.user$.subscribe((user) => {
      this.user = user;
    });

    this.routes = [
      { name: '🏠 Home', routerLink: '/', show: () => true },
      { name: '🔐 Login', routerLink: '/login', show: () => !this.isAuthenticated },
      { name: '📝 Register', routerLink: '/register', show: () => !this.isAuthenticated },
      { name: '➕ New item', routerLink: '/new-item', show: () => this.isAuthenticated },
      { name: '📦 My items', routerLink: '/my-items', show: () => this.isAuthenticated },
      { name: '👤 My profile', /*routerLink: '/my-profile'*/ click: () => {
        InfoboxUtil.showInfoBox({
          message: "WORK IN PROGRESS",
          type: 'error',
          duration: 3000
        })
      }, show: () => this.isAuthenticated },
      { name: '🚪 Logout', click: () => this.logout(), show: () => this.isAuthenticated }
    ];

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.menuOpen = false;
      }
    });
  }

  shopName: string = SITE_NAME;

  logout() : void {
    this.authService.logout();
  }
}
