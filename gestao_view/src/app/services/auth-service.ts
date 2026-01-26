import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../enviroments/enviroment';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Usuario } from '../interfaces/usuario';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Usuario;
}

interface UserStorage {
  id: number;
  nome: string;
  funcao: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth/login/';
  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, payload).pipe(
      tap(response => {
        localStorage.setItem('auth_token', response.token);
        
        const userStorage: UserStorage = {
          id: response.user.id,
          nome: response.user.nome,
          funcao: response.user.funcao,
          email: response.user.email
        };
        
        localStorage.setItem('user', JSON.stringify(userStorage));
        this.loggedIn$.next(true);
      })
    );
  }

  getUser(): UserStorage | null {
    try {
      const user = localStorage.getItem('user');
      if (!user) return null;
      
      const parsed = JSON.parse(user);
      
      if (!parsed.id || !parsed.nome || !parsed.funcao) {
        this.clearUserData();
        return null;
      }
      
      return parsed as UserStorage;
    } catch (error) {
      this.clearUserData();
      return null;
    }
  }

  hasRole(roles: string[]): boolean {
    const user = this.getUser();
    if (!user) return false;
    
    return roles.some(role => user.funcao.toLowerCase() === role.toLowerCase());
  }

  logout(): void {
    this.clearUserData();
    this.loggedIn$.next(false);
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  private clearUserData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
}

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data?.['roles'] as Array<string>;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = this.authService.getUser();

    if (!user) {
      console.warn('Usuário não autenticado');
      this.router.navigate(['/login']);
      return false;
    }

    const hasRole = requiredRoles.some(role => 
      user.funcao.toLowerCase() === role.toLowerCase()
    );

    if (!hasRole) {
      this.router.navigate(['/producao']);
      return false;
    }

    return true;
  }
}