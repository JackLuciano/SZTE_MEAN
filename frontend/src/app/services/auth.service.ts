import { Injectable, signal, computed, effect } from '@angular/core';
import { User } from '../components/models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token = signal<string | null>(localStorage.getItem('token'));
  private userSignalInternal: User | null = null;

  constructor() {
    effect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser && this.isAuthenticated()) {
        this.setUser(storedUser);
      } else {
        this.clearUser();
      }
    });
  }

  userSignal = computed(() => this.userSignalInternal);
  isAuthenticated = computed(() => {
    const tokenValue = this.token();
    return !!tokenValue && tokenValue.trim() !== '';
  });

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.clearUser();
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.token.set(token);
  }

  setUser(userData: string | null = null): void {
    const parsedUser =
      userData && typeof userData === 'string'
        ? JSON.parse(userData)
        : userData;

    const user = parsedUser ? User.fromJson(parsedUser) : null;
    this.userSignalInternal = user;

    if (!user) {
      this.logout();
    } else {
      localStorage.setItem('user', JSON.stringify(parsedUser));
    }
  }

  private clearUser(): void {
    this.userSignalInternal = null;
  }
}
