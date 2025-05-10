import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../components/models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userRole: string | null = null;
  private authenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  private userRoleSubject = new BehaviorSubject<string | null>(this.userRole);
  private user : User | null = null;
  private userSubject = new BehaviorSubject<User | null>(this.user);

  constructor() {
    this.userRole = localStorage.getItem('userRole');
  }

  get authenticated$() : Observable<boolean> {
    return this.authenticatedSubject.asObservable();
  }

  get userRole$() : Observable<string | null> {
    return this.userRoleSubject.asObservable();
  }

  get user$() : Observable<User | null> {
    return this.userSubject.asObservable();
  }

  getUserRole() : string | null {
    return this.userRole;
  }

  setUserRole(role: string) : void {
    this.userRole = role;
    localStorage.setItem('userRole', role);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token && token !== '';
  }

  logout() : void {
    this.userRole = null;
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.authenticatedSubject.next(false);
    this.userRoleSubject.next(null);
  }

  setToken(token: string) : void {
    localStorage.setItem('token', token);
    this.authenticatedSubject.next(true);
  }

  setUser() : void {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '') : null;
    this.user = user ? User.fromJson(user) : null;
    this.userSubject.next(this.user);
  }
}
