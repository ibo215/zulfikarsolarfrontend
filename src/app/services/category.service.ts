import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // استورد HttpErrorResponse
import { Observable, BehaviorSubject, throwError } from 'rxjs'; // استورد BehaviorSubject و throwError
import { catchError, finalize } from 'rxjs/operators'; // استورد catchError و finalize

export interface Category {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'https://localhost:7059/api/categories'; // تأكد من هذا الرابط
  private _loading = new BehaviorSubject<boolean>(false); // مؤشر التحميل
  loading$ = this._loading.asObservable(); // يمكن للمكونات الاشتراك فيه

  constructor(private http: HttpClient) { }

  getAllCategories(): Observable<Category[]> {
    this._loading.next(true); // بدء التحميل
    return this.http.get<Category[]>(this.apiUrl).pipe(
      catchError(this.handleHttpError),
      finalize(() => this._loading.next(false)) // إنهاء التحميل دائماً
    );
  }

  getCategoryById(id: number): Observable<Category> {
    this._loading.next(true);
    return this.http.get<Category>(`<span class="math-inline">\{this\.apiUrl\}/</span>{id}`).pipe(
      catchError(this.handleHttpError),
      finalize(() => this._loading.next(false))
    );
  }

  // دالة مساعدة لمعالجة أخطاء HTTP
  private handleHttpError = (errorResponse: HttpErrorResponse) => {
    let errorMessage = 'حدث خطأ غير معروف في جلب التصنيفات.';
    if (errorResponse.error instanceof ErrorEvent) {
      errorMessage = `خطأ من جانب العميل أو الشبكة: ${errorResponse.error.message}`;
    } else {
      if (errorResponse.error && typeof errorResponse.error === 'object') {
        if (errorResponse.error.title) {
          errorMessage = errorResponse.error.title;
        } else if (errorResponse.error.detail) {
          errorMessage = errorResponse.error.detail;
        } else if (errorResponse.error.errors) {
          errorMessage = Object.values(errorResponse.error.errors).flat().join(' ');
        }
      } else {
        errorMessage = `حدث خطأ في الخادم: ${errorResponse.status} ${errorResponse.statusText}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  };
}