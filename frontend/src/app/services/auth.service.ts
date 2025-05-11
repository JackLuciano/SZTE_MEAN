import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../components/models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  private user : User | null = null;
  private userSubject = new BehaviorSubject<User | null>(this.user);

  constructor() {
  }

  get authenticated$() : Observable<boolean> {
    return this.authenticatedSubject.asObservable();
  }

  get user$() : Observable<User | null> {
    return this.userSubject.asObservable();
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token && token !== '';
  }

  logout() : void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.authenticatedSubject.next(false);
  }

  setToken(token: string) : void {
    localStorage.setItem('token', token);
    this.authenticatedSubject.next(true);
  }

  setUser(userData: string | null = null) : void {
    const user = userData ? JSON.parse(userData) : null;
    this.user = user ? User.fromJson(user) : null;
    this.userSubject.next(this.user);

    if (!this.user) {
      this.logout();
    }
  }
}
