import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const redirectIfLoggedInGuard: CanActivateFn = (route, state) => {
  const hasToken = !!localStorage.getItem('token');

  const router = inject(Router);

  if (hasToken) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
