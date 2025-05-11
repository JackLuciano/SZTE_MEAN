import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../components/models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authenticatedSubject = new BehaviorSubject<boolean>(this.checkToken());
  private userSubject = new BehaviorSubject<User | null>(null);

  constructor() {}

  get authenticated$(): Observable<boolean> {
    return this.authenticatedSubject.asObservable();
  }

  get user$(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  private checkToken(): boolean {
    const token = localStorage.getItem('token');
    return !!token && token.trim() !== '';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.authenticatedSubject.next(false);
    this.clearUser();
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.authenticatedSubject.next(true);
  }

  setUser(userData: string | null = null): void {
    const parsedUser = userData ? JSON.parse(userData) : null;
    const user = parsedUser ? User.fromJson(parsedUser) : null;

    this.userSubject.next(user);

    if (!user) {
      this.logout();
    }
  }

  private clearUser(): void {
    this.userSubject.next(null);
  }
}
