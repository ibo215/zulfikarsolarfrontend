import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators'; // استورد take

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];

  return authService.isAuthenticated$.pipe(
    take(1), // خذ قيمة واحدة فقط ثم أكمل
    map(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/login']);
        return false;
      }

      // إذا كان المستخدم مصادقًا عليه، تحقق من الأدوار
      if (requiredRoles && requiredRoles.length > 0) {
        let hasRequiredRole = false;
        authService.userRoles$.pipe(take(1)).subscribe(userRoles => {
          hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
        });

        if (hasRequiredRole) {
          return true;
        } else {
          // إذا لم يكن لديه الدور المطلوب، يمكن توجيهه لصفحة "ممنوع" أو تسجيل الخروج
          console.warn('Access Denied: User does not have the required role.');
          router.navigate(['/access-denied']); // يمكنك إنشاء هذا المسار لاحقاً
          return false;
        }
      }

      // إذا كان مصادقًا عليه ولا توجد أدوار محددة مطلوبة، اسمح بالوصول
      return true;
    })
  );
};