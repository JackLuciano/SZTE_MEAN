import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { getAPIUrl } from '../../../app.config';
import { User } from '../../models/user';
import { InfoboxUtil } from '../../../utils/infobox-util';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm = signal<FormGroup | null>(null);
  message = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private httpClient: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = signal(this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    }));
  }

  forgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  onSubmit(): void {
    if (this.isFormInvalid()) {
      this.displayMessage('Please fill in all required fields.');
      return;
    }

    const form = this.loginForm();
    if (!form)
      return;

    const { username, password } = form.value;
    this.login(username, password);
  }

  private isFormInvalid(): boolean {
    return this.loginForm()!.invalid;
  }

  private displayMessage(message: string): void {
    this.message.set(message);
  }

  private login(username: string, password: string): void {
    this.httpClient.post(getAPIUrl(`auth/login`), { username, password }, { headers: { 'skip-auth': 'true' } })
      .subscribe({
        next: (response: any) => this.handleLoginSuccess(response),
        error: (error) => this.handleLoginError(error)
      });
  }

  private handleLoginSuccess(response: any): void {
    const { token, user } = response as { token: string; user: User };

    this.authService.setToken(token);
    const userData = JSON.stringify(user);
    localStorage.setItem('user', userData);
    this.authService.setUser(userData);

    this.router.navigate(['/']);
    InfoboxUtil.showMessage({
      message: 'Successfully logged in!',
      type: 'success',
      duration: 3000
    });
  }

  private handleLoginError(error: any): void {
    const message = error.error?.message || 'An error occurred';
    InfoboxUtil.showMessage({
      message,
      type: 'error',
      duration: 3000
    });
  }
}
