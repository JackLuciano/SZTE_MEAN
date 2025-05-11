import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { API_URL } from '../../../app.config';
import { InfoboxUtil } from '../../../utilts/infobox-util';

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

    this.httpClient.post(API_URL + 'auth/forgot-password', { email }, { headers: { 'skip-auth': 'true' } })
      .subscribe({
        next: (response: any) => {
          const { message } = response as { message: string };

          InfoboxUtil.showInfoBox({
            message: message,
            type: 'success',
            duration: 3000
          })
        },
        error: (error) => {
          const message = error.error?.message || 'An error occurred';
          InfoboxUtil.showInfoBox({
            message: message,
            type: 'error',
            duration: 3000
          })
        }
      });
  }
}
