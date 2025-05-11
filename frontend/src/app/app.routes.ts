import { Routes } from '@angular/router';
import { tokenGuard } from './guards/token.guard';
import { roleGuard } from './guards/role.guard';
import { redirectIfLoggedInGuard } from './guards/redirect-if-logged-in.guard';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
    },

    {
        path: 'login',
        canActivate: [redirectIfLoggedInGuard],
        loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'register',
        canActivate: [redirectIfLoggedInGuard],
        loadComponent: () => import('./components/auth/registration/registration.component').then(m => m.RegistrationComponent),
    },
    {
        path: 'forgot-password',
        canActivate: [redirectIfLoggedInGuard],
        loadComponent: () => import('./components/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    },

    {
        path: 'item',
        pathMatch: 'full',
        redirectTo: '/',
    },
    {
        path: 'item/:id',
        loadComponent: () => import('./components/item-display/item-display.component').then(m => m.ItemDisplayComponent),
    },
    {
        path: 'new-item',
        canActivate: [tokenGuard],
        loadComponent: () => import('./components/new-item/new-item.component').then(m => m.NewItemComponent),
    },
];
