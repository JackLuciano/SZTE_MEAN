import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, timer } from 'rxjs';
import { API_URL } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class ServerStatusService {

  constructor(private http: HttpClient) { }

  getServerStatus() : Observable<boolean> {
    return timer(0, 5000).pipe(
      switchMap(() =>
        this.http.get(API_URL + 'health').pipe(
          map(() => true),
          catchError(() => of(false))
        )
      )
    );
  }
}
