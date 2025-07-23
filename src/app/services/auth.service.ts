import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators'; // <--- أضف map هنا
import { Router } from '@angular/router';
// تثبيت هذه الحزمة:
// npm install jwt-decode

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

function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding JWT:", e);
    return null;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7059/api/Auth';
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuthenticated.asObservable();
  private _userRoles = new BehaviorSubject<string[]>([]); // لتخزين أدوار المستخدم
  userRoles$ = this._userRoles.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthenticationStatus();
  }

  private checkAuthenticationStatus(): void {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
       const decodedToken: any = decodeJwt(token);
        // تحقق من انتهاء صلاحية التوكن
        const expirationDate = new Date(decodedToken.exp * 1000);
        if (expirationDate > new Date()) {
          this._isAuthenticated.next(true);
          this.extractAndSetRoles(decodedToken); // استخراج الأدوار
        } else {
          this.logout(); // التوكن منتهي الصلاحية
        }
      } catch (error) {
        this.logout(); // توكن غير صالح
      }
    } else {
      this._isAuthenticated.next(false);
      this._userRoles.next([]);
    }
  }

  private extractAndSetRoles(decodedToken: any): void {
    let roles: string[] = [];
    if (decodedToken && decodedToken.role) {
      // إذا كان لديه دور واحد (سلسلة نصية)
      if (typeof decodedToken.role === 'string') {
        roles = [decodedToken.role];
      }
      // إذا كان لديه عدة أدوار (مصفوفة)
      else if (Array.isArray(decodedToken.role)) {
        roles = decodedToken.role;
      }
    }
    this._userRoles.next(roles);
  }

  register(username: string, email: string, password: string): Observable<AuthResponseDto> {
    const registerData: RegisterDto = { username, email, password };
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/register`, registerData).pipe(
      catchError(this.handleAuthError)
    );
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
          const decodedToken: any = decodeJwt(response.token);
          this.extractAndSetRoles(decodedToken); // استخراج الأدوار بعد تسجيل الدخول
        }
      }),
      catchError(this.handleAuthError)
    );
  }

  logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    this._isAuthenticated.next(false);
    this._userRoles.next([]); // مسح الأدوار عند تسجيل الخروج
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  // دالة للتحقق مما إذا كان المستخدم يمتلك دورًا معينًا
  hasRole(role: string): Observable<boolean> {
    return this.userRoles$.pipe(
      map(roles => roles.includes(role))
    );
  }

  private handleAuthError = (errorResponse: HttpErrorResponse) => {
    let errorMessage = 'حدث خطأ غير معروف.';
    if (errorResponse.error instanceof ErrorEvent) {
      errorMessage = `خطأ: ${errorResponse.error.message}`;
    } else {
      if (errorResponse.status === 401 || errorResponse.status === 403) {
        errorMessage = 'غير مصرح لك بالدخول أو بيانات الاعتماد غير صحيحة.';
        this.logout();
      } else if (errorResponse.error && typeof errorResponse.error === 'object' && 'errorMessage' in errorResponse.error) {
        errorMessage = (errorResponse.error as AuthResponseDto).errorMessage;
      } else if (errorResponse.status === 400) {
        if (errorResponse.error && typeof errorResponse.error === 'object') {
          if ('errors' in errorResponse.error && typeof errorResponse.error.errors === 'object') {
            errorMessage = Object.values(errorResponse.error.errors).flat().join(' ');
          } else if ('title' in errorResponse.error) {
            errorMessage = errorResponse.error.title;
          } else if ('detail' in errorResponse.error) {
            errorMessage = errorResponse.error.detail;
          }
        } else {
          errorMessage = errorResponse.message;
        }
      } else {
        errorMessage = `حدث خطأ في الخادم: ${errorResponse.status} ${errorResponse.statusText}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  };
}