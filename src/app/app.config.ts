import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

// استورد الخدمات هنا
import { AuthService } from './services/auth.service';
import { ProductService } from './services/product.service';
import { CategoryService } from './services/category.service';
import { authInterceptor } from './interceptors/auth.interceptor'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), // ضروري لأداء Angular
    provideRouter(routes), // يوفر نظام التوجيه
    provideHttpClient(withInterceptors([authInterceptor])),    // قم بتوفير الخدمات المخصصة هنا
    AuthService, // لجعل AuthService قابلاً للحقن في المكونات
    ProductService, // لجعل ProductService قابلاً للحقن
    CategoryService // لجعل CategoryService قابلاً للحقن
  ]
};