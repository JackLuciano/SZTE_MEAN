import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { CommonModule } from '@angular/common';

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

  constructor(private authService: AuthService){}

  ngOnInit() : void {
    this.authService.authenticated$.subscribe((authenticated: boolean) => {
      this.isAuthenticated = authenticated;
    });

    this.authService.userRole$.subscribe((role) => {
      this.userRole = role;
    });
  }

  shopName: string = '🛒 MyMarket';

  logout() : void {
    this.authService.logout();
  }
}
