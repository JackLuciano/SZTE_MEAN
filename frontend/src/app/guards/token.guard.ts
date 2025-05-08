import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const tokenGuard: CanActivateFn = (route, state) => {
  const hasToken = !!localStorage.getItem('token');

  const router = inject(Router);
  if (!hasToken) {
      router.navigate(['/login']);
      return false;
  }

  return true;
};
