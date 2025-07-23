import { Component, OnInit, Output, EventEmitter } from '@angular/core'; // استورد Output و EventEmitter
import { CommonModule } from '@angular/common'; // مهم للمكونات Standalone
import { Category, CategoryService } from '../../services/category.service'; // استورد CategoryService وواجهة Category

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = []; // مصفوفة لتخزين التصنيفات
  errorMessage: string = ''; // لتخزين رسائل الأخطاء
  @Output() categorySelected = new EventEmitter<number | null>(); // <--- لـ EventEmitter

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        this.errorMessage = 'فشل في جلب التصنيفات. يرجى المحاولة لاحقًا.';
        console.error('Error fetching categories:', err);
      }
    });
  }

  // دالة تُستدعى عند اختيار تصنيف
  onCategoryClick(categoryId: number | null): void {
    this.categorySelected.emit(categoryId); // إرسال الـ ID إلى المكون الأب
  }
}