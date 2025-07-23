import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Product, ProductService, CreateProductDto, UpdateProductDto } from '../../services/product.service'; // استورد DTOs
import { Category, CategoryService } from '../../services/category.service';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs'; // استورد Observable و Subscription

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  @Input() productId: number | null = null;
  productForm!: FormGroup;
  categories: Category[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  isEditMode: boolean = false;
  isLoading: boolean = false; // <--- مؤشر التحميل

  private loadingSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    public router: Router // public للسماح بالوصول من القالب
  ) { }

  ngOnInit(): void {
    // الاشتراك في حالة التحميل من ProductService
    this.loadingSubscription = this.productService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });

    this.initForm();
    this.loadCategories();
    if (this.productId) {
      this.isEditMode = true;
      this.loadProduct(this.productId);
    }
  }

  ngOnDestroy(): void {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }


  initForm(): void {
    const urlPattern = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i;

    this.productForm = this.fb.group({
      id: [0],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: ['', Validators.maxLength(1000)],
      imageUrl: ['', [Validators.pattern(urlPattern), Validators.maxLength(500)]],
      price: [0.01, [Validators.required, Validators.min(0.01)]],
      categoryId: ['', Validators.required],
      isActive: [true]
    });
  }

  loadCategories(): void {
    // لا نحتاج لـ isLoading هنا لأن CategoryService لديه مؤشر تحميل خاص به.
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        if (this.isEditMode && this.productForm.get('categoryId')?.value === '') {
          this.productForm.get('categoryId')?.setValue(this.categories[0]?.id || '');
        }
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        console.error('Error fetching categories for form:', err);
      }
    });
  }

  loadProduct(id: number): void {
    this.errorMessage = '';
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          id: product.id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          price: product.price,
          // تأكد من أن CategoryId الذي يعود من الـ Backend هو نفس نوع الـ Form Control
          categoryId: product.categoryId,
          isActive: product.isActive
        });
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        console.error('Error fetching product for edit:', err);
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.productForm.invalid) {
      this.errorMessage = 'الرجاء ملء جميع الحقول المطلوبة بشكل صحيح.';
      return;
    }

    const productData = this.productForm.value;

    if (this.isEditMode) {
      // في وضع التعديل، قم بتمرير UpdateProductDto
      const updateDto: UpdateProductDto = productData;
      this.productService.updateProduct(updateDto.id, updateDto).subscribe({
        next: () => {
          this.successMessage = 'تم تحديث المنتج بنجاح!';
          this.router.navigate(['/admin/products']); // العودة إلى قائمة المنتجات بعد التحديث
        },
        error: (err: Error) => {
          this.errorMessage = err.message;
          console.error('Update product error:', err);
        }
      });
    } else {
      // في وضع الإنشاء، قم بتمرير CreateProductDto
      const createDto: CreateProductDto = productData;
      this.productService.createProduct(createDto).subscribe({
        next: () => {
          this.successMessage = 'تم إضافة المنتج بنجاح!';
          // إعادة تعيين النموذج بعد الإضافة
          this.productForm.reset({ isActive: true, price: 0.01, categoryId: this.categories[0]?.id || '' });
          this.router.navigate(['/admin/products']); // العودة إلى قائمة المنتجات بعد الإضافة
        },
        error: (err: Error) => {
          this.errorMessage = err.message;
          console.error('Create product error:', err);
        }
      });
    }
  }
}