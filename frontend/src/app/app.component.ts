import { Component, OnInit } from '@angular/core';
import { ServerStatusService } from './services/server-status.service';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  serverStatus: boolean = false;

  constructor(private serverStatusService: ServerStatusService) { }

  ngOnInit() : void {
    this.serverStatusService.getServerStatus().subscribe((status) => {
      this.serverStatus = status;

      console.log('Server status changed to:', status);
    });

    // REMOVE THIS AFTER TESTING
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
  }
}
