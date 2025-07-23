import { Routes } from '@angular/router';
import { ProductsComponent } from './components/products/products.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProductFormComponent } from './admin/product-form/product-form.component'; // <--- استورد ProductFormComponent
import { authGuard  } from './guards/auth.guard'; // سنقوم بإنشاء هذا الـ Guard لاحقاً
import { AdminProductsListComponent } from './admin/products-list/products-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'products', component: ProductsComponent },
  { path: 'categories', component: CategoriesComponent }, // يمكن دمجها أو استخدامها بشكل مختلف
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // مسارات لوحة التحكم (محمية)
  { path: 'admin/products', component: AdminProductsListComponent, canActivate: [authGuard], data: { roles: ['Admin'] } },
  { path: '  ', component: ProductFormComponent, canActivate: [authGuard], data: { roles: ['Admin'] } }, // <--- تم التعديل هنا
  { path: 'admin/products/edit/:id', component: ProductFormComponent, canActivate: [authGuard], data: { roles: ['Admin'] } }, // <--- تم التعديل هنا

  { path: '**', redirectTo: '/products' }
];