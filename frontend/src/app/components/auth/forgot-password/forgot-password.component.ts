import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../models/User';
import { AuthService } from '../../../services/auth.service';
import { API_URL } from '../../../app.config';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  message: string = '';

  constructor(private fb: FormBuilder, private router: Router, private httpClient: HttpClient) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  };

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.message = 'Please fill in all required fields.';
      return;
    }

    const { email } : { email: string; } = this.forgotPasswordForm.value;

    this.httpClient.post(API_URL + 'auth/forgot-password', { email })
      .subscribe({
        next: (response: any) => {
          const { message } = response as { message: string };

          this.message = message;
        },
        error: (error) => {
          if (error.status === 404) {
            this.message = error.error?.message || 'Email not found';
          } else {
            this.message = 'Unexpected error occurred.';
          }
        }
      });
  }
}
