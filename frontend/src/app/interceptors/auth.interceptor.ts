import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { InfoboxUtil } from '../utilts/infobox-util';

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');

  const skipAuth = request.headers.get('skip-auth');
  if (skipAuth) {
    return next(request);
  }

  if (token) {
    request = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(request).pipe(
    tap((event) => {
      
    }),
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        authService.setUser();
        router.navigate(['/']);

        InfoboxUtil.showInfoBox({
          message: "Session expired. Please log in again.",
          type: 'error',
          duration: 3000
        })
      }

      return throwError(() => error);
    })
  );
}