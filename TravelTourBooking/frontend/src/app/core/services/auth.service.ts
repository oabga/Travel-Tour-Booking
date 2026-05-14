import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginDto, RegisterDto, AuthResponse, JwtPayload } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'jwt_token';

  private currentUser = signal<JwtPayload | null>(this.decodeStoredToken());

  user = this.currentUser.asReadonly();
  isAuthenticated = computed(() => {
    const u = this.currentUser();
    return !!u && u.exp * 1000 > Date.now();
  });
  userRole = computed(() => this.currentUser()?.role ?? null);
  userId = computed(() => {
    const id = this.currentUser()?.nameid;
    return id ? parseInt(id, 10) : null;
  });

  constructor(private http: HttpClient, private router: Router) {}

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl + '/login', dto).pipe(
      tap(res => this.setToken(res.token))
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl + '/register', dto).pipe(
      tap(res => this.setToken(res.token))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasRole(role: string): boolean {
    return this.userRole() === role;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.currentUser.set(this.decodeJwt(token));
  }

  private decodeStoredToken(): JwtPayload | null {
    const token = typeof localStorage !== 'undefined'
      ? localStorage.getItem(this.TOKEN_KEY)
      : null;
    if (!token) return null;
    const payload = this.decodeJwt(token);
    if (payload && payload.exp * 1000 > Date.now()) return payload;
    return null;
  }

  private decodeJwt(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return {
        nameid: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? payload.nameid,
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? payload.email,
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? payload.role,
        exp: payload.exp
      };
    } catch {
      return null;
    }
  }
}
