import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// تأكد من استيراد AbstractControl
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms'; // <--- أضف AbstractControl هنا
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordMatchValidator }); // هنا نستخدم الـ validator
  }

  // Validator مخصص لمطابقة كلمة المرور
  // غير نوع المعلمة من FormGroup إلى AbstractControl
  passwordMatchValidator(control: AbstractControl): { [s: string]: boolean } | null { // <--- تم التعديل هنا (form أصبحت control)
    const formGroup = control as FormGroup; // <--- قم بتحويلها إلى FormGroup
    const passwordControl = formGroup.get('password');
    const confirmPasswordControl = formGroup.get('confirmPassword');

    // إذا كانت أي من الحقول غير موجودة أو كانت فارغة، لا يوجد خطأ في المطابقة بعد
    if (!passwordControl || !confirmPasswordControl || !passwordControl.value || !confirmPasswordControl.value) {
      return null;
    }

    // إذا كانت كلمتا المرور لا تتطابقان
    if (passwordControl.value !== confirmPasswordControl.value) {
      // قم بتعيين خطأ على حقل confirmPassword أيضاً لإظهار الخطأ بجانبه
      confirmPasswordControl.setErrors({ mismatch: true });
      return { 'mismatch': true };
    } else {
      // إذا تطابقت، تأكد من إزالة خطأ التضارب إذا كان موجوداً
      if (confirmPasswordControl.hasError('mismatch')) {
        confirmPasswordControl.setErrors(null);
      }
      return null;
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.valid) {
      const registerData = this.registerForm.value;
      this.authService.register(registerData.username, registerData.email, registerData.password).subscribe({
        next: (response) => {
          if (response.isAuthSuccessful) {
            this.successMessage = 'تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول.';
            this.registerForm.reset();
          } else {
            this.errorMessage = response.errorMessage || 'فشل التسجيل.';
          }
        },
        error: (err) => {
          this.errorMessage = 'حدث خطأ غير متوقع. يرجى المحاولة لاحقًا.';
          console.error('Registration error:', err);
        }
      });
    } else {
      // إذا كان النموذج غير صالح، وتحقق من خطأ mismatch بشكل خاص
      if (this.registerForm.errors?.['mismatch']) {
        this.errorMessage = 'كلمتا المرور غير متطابقتين.';
      } else {
        this.errorMessage = 'الرجاء ملء جميع الحقول بشكل صحيح.';
      }
    }
  }
}