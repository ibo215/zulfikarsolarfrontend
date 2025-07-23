import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config'; // أو قم بتعديل هذا الملف إذا كنت تستخدمه
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
// import { provideReactiveFormsModule } from '@angular/forms'; // <--- قم بإزالة هذا السطر

// استورد الخدمات هنا (إذا كنت توفرها مباشرة في main.ts)
import { AuthService } from './app/services/auth.service';
import { ProductService } from './app/services/product.service';
import { CategoryService } from './app/services/category.service';


bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    // provideReactiveFormsModule() // <--- قم بإزالة هذا السطر
    // تأكد من أن الخدمات موجودة هنا لتجنب مشاكل حقن التبعية
    AuthService,
    ProductService,
    CategoryService
  ]
}).catch((err) => console.error(err));