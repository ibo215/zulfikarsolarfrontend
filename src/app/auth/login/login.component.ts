import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      usernameOrEmail: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      this.authService.login(loginData.usernameOrEmail, loginData.password).subscribe({
        next: (response) => {
          if (response.isAuthSuccessful) {
            console.log('Login successful!', response.token);
            this.router.navigate(['/products']);
          } else {
            this.errorMessage = response.errorMessage || 'فشل تسجيل الدخول.';
          }
        },
        error: (err) => {
          this.errorMessage = 'حدث خطأ غير متوقع. يرجى المحاولة لاحقًا.';
          console.error('Login error:', err);
        }
      });
    } else {
      this.errorMessage = 'الرجاء إدخال اسم المستخدم/البريد الإلكتروني وكلمة المرور.';
    }
  }
}