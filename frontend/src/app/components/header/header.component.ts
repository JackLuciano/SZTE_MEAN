import { Component, OnInit, signal, effect } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { CommonModule } from '@angular/common';
import { getSiteName } from '../../app.config';
import { User } from '../models/user';
import { InfoboxUtil } from '../../utils/infobox-util';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  menuOpen = signal(false);
  isAuthenticated = signal(false);
  user = signal<User | null>(null);

  routes = signal<any[]>([]);
  
  shopName = signal(getSiteName());

  constructor(private authService : AuthService, private router : Router){
    effect(() => {
      const auth = this.authService.isAuthenticated();
      this.isAuthenticated.set(auth);

      if (!auth) {
        const currentRoute = this.router.url;

        this.routes().forEach((route) => {
          if (route.routerLink === currentRoute && !route.show()) {
            this.router.navigate(['/']);
          }
        })
      }
    });

    effect(() => {
      const user = this.authService.userSignal();
      this.user.set(user);
    });
  }

  private setupRoutes() : void {
    this.routes.set([
      { name: '🏠 Home', routerLink: '/', show: () => true },
      { name: '🔐 Login', routerLink: '/login', show: () => !this.isAuthenticated() },
      { name: '📝 Register', routerLink: '/register', show: () => !this.isAuthenticated() },
      { name: '➕ New item', routerLink: '/new-item', show: () => this.isAuthenticated() },
      { name: '📦 My items', routerLink: '/my-items', show: () => this.isAuthenticated() },
      { name: '👤 My profile', /*routerLink: '/my-profile'*/ click: () => {
        InfoboxUtil.showMessage({
          message: "WORK IN PROGRESS",
          type: 'info',
          duration: 3000
        })
      }, show: () => this.isAuthenticated() },
      { name: '🚪 Logout', click: () => this.logout(), show: () => this.isAuthenticated() }
    ]);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.menuOpen.set(false);
      }
    });
  }

  ngOnInit() : void {
    this.setupRoutes();
  }

  logout() : void {
    this.authService.logout();
  }
}
