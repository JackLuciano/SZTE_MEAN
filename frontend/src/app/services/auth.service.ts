import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userRole: string | null = null;
  private authenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  private userRoleSubject = new BehaviorSubject<string | null>(this.userRole);

  constructor() {
    this.userRole = localStorage.getItem('userRole');
  }

  get authenticated$() : Observable<boolean> {
    return this.authenticatedSubject.asObservable();
  }

  get userRole$() : Observable<string | null> {
    return this.userRoleSubject.asObservable();
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

    this.authenticatedSubject.next(false);
    this.userRoleSubject.next(null);
  }

  setToken(token: string) : void {
    localStorage.setItem('token', token);
    this.authenticatedSubject.next(true);
  }
}
