import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../models/User';
import { AuthService } from '../../../services/auth.service';
import { API_URL } from '../../../app.config';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  message : string = '';

  constructor(private fb: FormBuilder, private router: Router, private httpClient: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  forgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.message = 'Please fill in all required fields.';
      return;
    }

    const { username, password } : { username: string; password: string; } = this.loginForm.value;
    
    this.httpClient.post(API_URL + 'auth/login', { username, password })
      .subscribe({
        next: (response: any) => {
          const { token, user } = response as { token: string; user: User };
          
          this.authService.setToken(token);
          localStorage.setItem('user', JSON.stringify(user));

          this.message = "Successfully logged in! Redirecting to home page...";

          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (error) => {
          if (error.status === 401) {
            this.message = error.error?.message || 'Unauthorized';
          } else {
            this.message = 'Unexpected error occurred.';
          }
        }
      });
  }
}
