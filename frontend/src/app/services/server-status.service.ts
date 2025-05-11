import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, timer } from 'rxjs';
import { API_URL } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class ServerStatusService {

  private readonly healthCheckInterval = 5000;
  private readonly healthEndpoint = `${API_URL}health`;

  constructor(private http: HttpClient) {}

  getServerStatus(): Observable<boolean> {
    return timer(0, this.healthCheckInterval).pipe(
      switchMap(() => this.checkServerHealth())
    );
  }

  private checkServerHealth(): Observable<boolean> {
    return this.http.get(this.healthEndpoint).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
