import { Component, OnInit, signal, effect } from '@angular/core';
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
  serverStatus = signal<boolean>(false);
  updatingUser = signal<boolean>(false);
  updateTimer = signal<any>(null);

  constructor(
    private infoboxService: InfoboxService,
    private serverStatusService: ServerStatusService,
    private titleService: Title,
    private authService: AuthService,
    private httpClient: HttpClient,
  ) {
    this.initializeInfobox();

    effect(() => {
      const oldStatus = this.serverStatus();
      this.serverStatus.set(this.serverStatusService.getServerStatus());

      if (oldStatus !== this.serverStatus()) {
        console.log('Server status changed to:', this.serverStatus());
      }
    })
  }

  ngOnInit(): void {
    this.setPageTitle();
    this.initializeUser();
    this.verifyToken();

    setInterval(() => this.verifyToken(), 5000);

    // this.infoboxService.show({
    //   message: 'Welcome to the application!',
    //   type: 'success',
    //   duration: 3000
    // });
  }

  private initializeInfobox(): void {
    InfoboxUtil.initialize(this.infoboxService);
  }

  private setPageTitle(): void {
    this.titleService.setTitle(getSiteName());
  }

  private initializeUser(): void {
    const user = localStorage.getItem('user');
    if (!user)
      return;

    this.authService.setUser(user);
  }

  private verifyToken(): void {
    const token = localStorage.getItem('token');
    if (!token)
      return;

    this.updateTimer.set(setTimeout(() => {
      this.updatingUser.set(true);
    }, 1000));
    
    this.httpClient.get(getAPIUrl(`auth/verify`)).subscribe(
      (response: any) => {
        clearTimeout(this.updateTimer());
        this.updatingUser.set(false);
        this.authService.setUser(response.user);
      },
    );
  }
}
