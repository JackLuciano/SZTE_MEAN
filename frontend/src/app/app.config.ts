import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { routes } from './app.routes';

const API_URL = 'http://127.0.0.1:3000/';
export const getAPIUrl = (path: string) => `${API_URL}${path}`;

const SITE_NAME = '🛒 MyMarket';
export const getSiteName = () => SITE_NAME;

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideAnimationsAsync(),
  ],
};
