import { Component, OnInit } from '@angular/core';
import { ServerStatusService } from './services/server-status.service';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { Title } from '@angular/platform-browser';
import { SITE_NAME } from './app.config';
import { AuthService } from './services/auth.service';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './app.config';
import { Router } from '@angular/router';
import { InfoboxContainerComponent } from './components/infobox-container/infobox-container.component';
import { InfoboxUtil } from './utilts/infobox-util';
import { InfoboxService } from './services/infobox.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, InfoboxContainerComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  serverStatus: boolean = false;

  constructor(private infoboxService: InfoboxService, private serverStatusService: ServerStatusService, private titleService: Title, private authService: AuthService, private httpClient: HttpClient, private router: Router) {
    InfoboxUtil.init(this.infoboxService);
  }

  ngOnInit() : void {
    this.serverStatusService.getServerStatus().subscribe((status) => {
      this.serverStatus = status;

      console.log('Server status changed to:', status);
    });

    this.titleService.setTitle(SITE_NAME);
    this.authService.setUser(localStorage.getItem('user'));

    const token = localStorage.getItem('token');
    if (token) {
      this.httpClient.get(API_URL + 'auth/verify').subscribe({});
    }
  }
}
