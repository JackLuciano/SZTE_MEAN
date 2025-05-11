import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const tokenGuard: CanActivateFn = () => {
  const router = inject(Router);
  const hasToken = Boolean(localStorage.getItem('token'));

  if (!hasToken) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
