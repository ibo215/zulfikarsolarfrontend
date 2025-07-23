import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators'; // استيراد map, take كان خاطئ هنا، تم إزالته

export interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  categoryId: number;
  categoryName: string;
  isActive: boolean;
  dateAdded: Date;
  lastModified: Date | null;
}

export interface CreateProductDto {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  categoryId: number;
  isActive: boolean;
}

export interface UpdateProductDto {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  categoryId: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://localhost:7059/api/products'; // تأكد من هذا الرابط (https أو http حسب الـ Backend)
  private _loading = new BehaviorSubject<boolean>(false); // مؤشر التحميل
  loading$ = this._loading.asObservable(); // يمكن للمكونات الاشتراك فيه

  constructor(private http: HttpClient) { }

  getAllProducts(categoryId: number | null = null): Observable<Product[]> {
    this._loading.next(true); // بدء التحميل
    let url = this.apiUrl;
    if (categoryId) {
      // بناء الـ URL باستخدام Template Literals (علامة الباك تيك ` `)
      url = `${this.apiUrl}?categoryId=${categoryId}`; // <--- تم التصحيح هنا
    }
    return this.http.get<Product[]>(url).pipe(
      catchError(this.handleHttpError), // معالجة الأخطاء
      finalize(() => this._loading.next(false)) // إنهاء التحميل دائماً
    );
  }

  getProductById(id: number): Observable<Product> {
    this._loading.next(true);
    // بناء الـ URL باستخدام Template Literals (علامة الباك تيك ` `)
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe( // <--- تم التصحيح هنا
      catchError(this.handleHttpError),
      finalize(() => this._loading.next(false))
    );
  }

  createProduct(product: CreateProductDto): Observable<any> {
    this._loading.next(true);
    return this.http.post<any>(this.apiUrl, product).pipe(
      catchError(this.handleHttpError),
      finalize(() => this._loading.next(false))
    );
  }

  updateProduct(id: number, product: UpdateProductDto): Observable<any> {
    this._loading.next(true);
    // بناء الـ URL باستخدام Template Literals (علامة الباك تيك ` `)
    return this.http.put<any>(`${this.apiUrl}/${id}`, product).pipe( // <--- تم التصحيح هنا
      catchError(this.handleHttpError),
      finalize(() => this._loading.next(false))
    );
  }

  deleteProduct(id: number): Observable<any> {
    this._loading.next(true);
    // بناء الـ URL باستخدام Template Literals (علامة الباك تيك ` `)
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe( // <--- تم التصحيح هنا
      catchError(this.handleHttpError),
      finalize(() => this._loading.next(false))
    );
  }

  // دالة مساعدة لمعالجة أخطاء HTTP (بخلاف أخطاء المصادقة التي تعالجها AuthService)
  private handleHttpError = (errorResponse: HttpErrorResponse) => {
    let errorMessage = 'حدث خطأ غير معروف في جلب البيانات.';
    if (errorResponse.error instanceof ErrorEvent) {
      errorMessage = `خطأ من جانب العميل أو الشبكة: ${errorResponse.error.message}`;
    } else {
      // خطأ من جانب الخادم (مثل 400, 404, 500)
      if (errorResponse.error && typeof errorResponse.error === 'object') {
        if (errorResponse.error.title) { // ProblemDetails title
          errorMessage = errorResponse.error.title;
        } else if (errorResponse.error.detail) { // ProblemDetails detail
          errorMessage = errorResponse.error.detail;
        } else if (errorResponse.error.errors) { // Model State Errors
          errorMessage = Object.values(errorResponse.error.errors).flat().join(' ');
        }
      } else {
        errorMessage = `حدث خطأ في الخادم: ${errorResponse.status} ${errorResponse.statusText}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  };
}