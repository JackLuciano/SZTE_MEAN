import { Injectable, signal, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getAPIUrl } from '../app.config';
import { catchError, map, of } from 'rxjs';
import { timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServerStatusService {
  private readonly http = signal<HttpClient>(inject(HttpClient));

  private readonly healthCheckInterval = signal<number>(5000);
  private readonly healthEndpoint = signal<string>(getAPIUrl(`health`));

  readonly serverOnline = signal<boolean>(true);

  constructor() {
    effect(() => {
      timer(0, this.healthCheckInterval()).subscribe(() => {
        this.http().get(this.healthEndpoint()).pipe(
          map(() => true),
          catchError(() => of(false))
        ).subscribe((status) => {
          this.serverOnline.set(status);
        });
      });
    });
  }

  getServerStatus(): boolean {
    return this.serverOnline();
  }
}