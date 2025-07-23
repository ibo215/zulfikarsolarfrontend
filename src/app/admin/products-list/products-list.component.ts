import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // لاستخدام خدمة المصادقة (لصلاحيات الحذف مثلاً)
import { Observable, Subscription } from 'rxjs'; // استورد Observable و Subscription

@Component({
  selector: 'app-admin-products-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css'
})
export class AdminProductsListComponent implements OnInit {
  products: Product[] = [];
  errorMessage: string = '';
  isLoading: boolean = false; // <--- مؤشر التحميل
  isAdmin: boolean = false;

  private loadingSubscription!: Subscription; // للاشتراك في حالة التحميل

  constructor(private productService: ProductService, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    // الاشتراك في حالة التحميل من ProductService
    this.loadingSubscription = this.productService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });

    this.loadProducts();

    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
        if (isAuthenticated && localStorage.getItem('jwtToken')) {
            // هنا يجب أن يكون لديك منطق للتحقق من دور Admin
            // هذا المنطق هو تبسيطي. الطريقة الصحيحة ستكون بقراءة الأدوار من التوكن أو جلبها من API
            // For demo purposes, we can assume if the user is authenticated, they have basic access
            // to admin panel for now, but to ensure 'Admin' role, you need to read the token.
            // Assuming "admin" user is logged in for full admin features in this demo.
            this.isAdmin = true; // <--- هذا افتراضي. يجب التحقق من الدور الفعلي.
        } else {
            this.isAdmin = false;
        }
    });
  }

  // جيد لإلغاء الاشتراك عند تدمير المكون لتجنب تسرب الذاكرة
  ngOnDestroy(): void {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }


  loadProducts(): void {
    this.errorMessage = ''; // مسح الأخطاء السابقة
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err: Error) => { // نوع الخطأ هو Error
        this.errorMessage = err.message; // جلب الرسالة من الخطأ الذي تم إلقاؤه في الخدمة
        console.error('Error fetching products from admin list:', err);
      }
    });
  }

  deleteProduct(id: number): void {
    if (confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟')) {
      this.errorMessage = ''; // مسح الأخطاء السابقة
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== id);
          console.log('Product deleted successfully.');
        },
        error: (err: Error) => { // نوع الخطأ هو Error
          this.errorMessage = err.message; // جلب الرسالة من الخطأ الذي تم إلقاؤه في الخدمة
          console.error('Delete product error:', err);
        }
      });
    }
  }

  editProduct(id: number): void {
    this.router.navigate(['/admin/products/edit', id]);
  }

  addProduct(): void {
    this.router.navigate(['/admin/products/add']);
  }
}