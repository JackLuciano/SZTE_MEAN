import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { ServerStatusService } from './services/server-status.service';
import { AuthService } from './services/auth.service';
import { InfoboxService } from './services/infobox.service';

import { HeaderComponent } from './components/header/header.component';
import { InfoboxContainerComponent } from './components/infobox-container/infobox-container.component';

import { InfoboxUtil } from './utils/infobox-util';
import { getSiteName, getAPIUrl } from './app.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, InfoboxContainerComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  serverStatus: boolean = false;
  updatingUser: boolean = false;
  updateTimer: any;

  constructor(
    private infoboxService: InfoboxService,
    private serverStatusService: ServerStatusService,
    private titleService: Title,
    private authService: AuthService,
    private httpClient: HttpClient,
    private router: Router
  ) {
    this.initializeInfobox();
  }

  ngOnInit(): void {
    this.initializeServerStatus();
    this.setPageTitle();
    this.initializeUser();
    this.verifyToken();

    setInterval(() => this.verifyToken(), 5000);
  }

  private initializeInfobox(): void {
    InfoboxUtil.initialize(this.infoboxService);
  }

  private initializeServerStatus(): void {
    this.serverStatusService.getServerStatus().subscribe((status) => {
      const oldStatus = this.serverStatus;
      this.serverStatus = status;

      if (oldStatus !== status) {
        console.log('Server status changed to:', status);
      }
    });
  }

  private setPageTitle(): void {
    this.titleService.setTitle(getSiteName());
  }

  private initializeUser(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.authService.setUser(user);
    }
  }

  private verifyToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.updateTimer = setTimeout(() => {
        this.updatingUser = true;
      }, 1000);
      this.httpClient.get(getAPIUrl(`auth/verify`)).subscribe(
        (response: any) => {
          clearTimeout(this.updateTimer);
          this.updatingUser = false;
          this.authService.setUser(response.user);
        },
      );
    }
  }
}
