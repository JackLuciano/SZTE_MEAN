import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { getAPIUrl } from '../../../app.config';
import { InfoboxUtil } from '../../../utils/infobox-util';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm = signal<FormGroup | null>(null);
  message = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private httpClient: HttpClient
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.forgotPasswordForm = signal(this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    }));
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }

  onSubmit(): void {
    const form = this.forgotPasswordForm();
    if (!form || this.isFormInvalid()) {
      this.message.set('Please fill in all required fields.');
      return;
    }

    this.sendForgotPasswordRequest();
  }

  private isFormInvalid(): boolean {
    return this.forgotPasswordForm()!.invalid;
  }

  private sendForgotPasswordRequest(): void {
    const { email } = this.forgotPasswordForm()!.value;

    this.httpClient
      .post(getAPIUrl(`auth/forgot-password`), { email }, { headers: { 'skip-auth': 'true' } })
      .subscribe({
        next: (response: any) => this.handleSuccess(response),
        error: (error) => this.handleError(error),
      });
  }

  private handleSuccess(response: any): void {
    const { message } = response as { message: string };
    InfoboxUtil.showMessage({
      message,
      type: 'success',
      duration: 3000,
    });
  }

  private handleError(error: any): void {
    const message = error.error?.message || 'An error occurred';
    InfoboxUtil.showMessage({
      message,
      type: 'error',
      duration: 3000,
    });
  }
}
