import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

interface LoginDto {
  usernameOrEmail: string;
  password: string;
}

interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponseDto {
  isAuthSuccessful: boolean;
  errorMessage: string;
  token: string;
  userId: string;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:7059/api/Auth'; // تأكد من هذا الرابط
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuthenticated.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthenticationStatus();
  }

  private checkAuthenticationStatus(): void {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      this._isAuthenticated.next(true);
    } else {
      this._isAuthenticated.next(false);
    }
  }

  register(username: string, email: string, password: string): Observable<AuthResponseDto> {
    const registerData: RegisterDto = { username, email, password };
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/register`, registerData);
  }

  login(usernameOrEmail: string, password: string): Observable<AuthResponseDto> {
    const loginData: LoginDto = { usernameOrEmail, password };
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/login`, loginData).pipe(
      tap((response) => {
        if (response.isAuthSuccessful && response.token) {
          localStorage.setItem('jwtToken', response.token);
          localStorage.setItem('username', response.username);
          localStorage.setItem('userId', response.userId);
          localStorage.setItem('email', response.email);
          this._isAuthenticated.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    this._isAuthenticated.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }
}