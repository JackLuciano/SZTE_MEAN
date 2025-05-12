import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { InfoboxUtil } from '../utils/infobox-util';

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');

  if (shouldSkipAuth(request)) {
    return next(request);
  }

  const authorizedRequest = addAuthorizationHeader(request, token);

  return next(authorizedRequest).pipe(
    tap(handleResponse),
    catchError((error) => handleError(error, authService, router))
  );
};

function shouldSkipAuth(request: any): boolean {
  return !!request.headers.get('skip-auth');
}

function addAuthorizationHeader(request: any, token: string | null): any {
  if (token) {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
  }
  return request;
}

function handleResponse(event: any): void {
  
}

function handleError(error: any, authService: AuthService, router: Router) {
  if (error.status === 401 || error.status === 403) {
    clearSession(authService);
    router.navigate(['/']);
    InfoboxUtil.showMessage({
      message: "Session expired. Please log in again.",
      type: 'error',
      duration: 3000
    });
  }
  return throwError(() => error);
}

function clearSession(authService: AuthService): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  authService.setUser();
}