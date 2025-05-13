import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
   const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.userSignal();

    if (!user || user.role !== 'admin') {
      router.navigate(['/']);
      return false;
    }

    return true;
};
