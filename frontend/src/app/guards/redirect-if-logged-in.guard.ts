import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const redirectIfLoggedInGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  if (isLoggedIn) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
