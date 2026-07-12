import {inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.dev';  
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';
import { isTokenExpired, getRolesFromToken } from '../utils/jwt.utils';


@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.loadUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  get isAuthenticated(): boolean {
    const user = this.currentUserSubject.value;
    if(!user || !user.token) {
      return false;
    }
    if (isTokenExpired(user.token)){
      this.logout();
      return false;
    }
    return true;
  }

  get currentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.currentUserSubject.value?.token ?? null;
  }

  get roles(): string[] {
    const token = this.token;
    if (!token) {
      return [];
    }
    return getRolesFromToken(token);
  }

  hasRole(roleName: string): boolean {
    return this.roles.some(r => r.toLowerCase() === roleName.toLowerCase());
  }


  // login
  login(credintials: LoginRequest):Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/login`, credintials).pipe(
      tap(response => this.saveUser(response))
    )
  }

  // register
  register(credintials: RegisterRequest):
  Observable<AuthResponse>{
    return this.http.post<AuthResponse>
    (`${this.apiUrl}/auth/register`, credintials).pipe(
      tap(response => this.saveUser(response))
    )
  }

  // logout
  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    
  }

  //------------------------ Helpers ------------------------

  // save user to local storage
  private saveUser(user: AuthResponse) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // load user from local storage
  private loadUser(): AuthResponse | null {
    const user = localStorage.getItem('currentUser');
    return user ? (JSON.parse(user) as AuthResponse) : null;
  }

}
