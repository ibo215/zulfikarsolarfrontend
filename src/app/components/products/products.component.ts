import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router'; // <--- استورد ActivatedRoute و Router
import { CategoriesComponent } from '../categories/categories.component'; // استورد CategoriesComponent

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, CategoriesComponent], // <--- أضف CategoriesComponent هنا
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  errorMessage: string = '';
  selectedCategoryId: number | null = null; // لتخزين معرف التصنيف المختار

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute, // لحقن ActivatedRoute
    private router: Router // لحقن Router
  ) { }

  ngOnInit(): void {
    // جلب المنتجات عند تهيئة المكون
    this.loadProducts(this.selectedCategoryId); // تحميل المنتجات في البداية

    // يمكنك استخدام هذه الطريقة لمراقبة التغييرات في Query Params (إذا قررت استخدامها)
    // this.route.queryParams.subscribe(params => {
    //   this.selectedCategoryId = params['categoryId'] ? +params['categoryId'] : null;
    //   this.loadProducts(this.selectedCategoryId);
    // });
  }

  // دالة لتحميل المنتجات بناءً على التصنيف
  loadProducts(categoryId: number | null): void {
    this.productService.getAllProducts(categoryId).subscribe({
      next: (data) => {
        this.products = data.filter(p => p.isActive); // عرض المنتجات النشطة فقط
      },
      error: (err) => {
        this.errorMessage = 'فشل في جلب المنتجات. يرجى المحاولة لاحقًا.';
        console.error('Error fetching products:', err);
      }
    });
  }

  // دالة تُستدعى من CategoriesComponent عند اختيار تصنيف
  onCategorySelected(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.loadProducts(categoryId); // إعادة تحميل المنتجات بالتصنيف الجديد
  }
}