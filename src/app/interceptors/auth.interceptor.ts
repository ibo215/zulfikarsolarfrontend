import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwtToken'); // جلب التوكن من Local Storage

  // استثني طلبات الـ authentication (تسجيل الدخول والتسجيل) من إضافة التوكن
  // لأنها لا تتطلب توكن، وإضافة توكن قد تسبب مشاكل أحيانًا.
  if (req.url.includes('/api/Auth/login') || req.url.includes('/api/Auth/register')) {
    return next(req);
  }

  if (token) {
    // إذا كان هناك توكن، قم بنسخ الطلب الأصلي وأضف رأس Authorization
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  } else {
    // إذا لم يكن هناك توكن، أرسل الطلب الأصلي بدون رأس Authorization
    return next(req);
  }
};