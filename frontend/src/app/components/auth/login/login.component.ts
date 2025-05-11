import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { API_URL } from '../../../app.config';
import { User } from '../../models/user';
import { InfoboxUtil } from '../../../utilts/infobox-util';

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
    
    this.httpClient.post(API_URL + 'auth/login', { username, password }, { headers: { 'skip-auth': 'true' } })
      .subscribe({
      next: (response: any) => {
          const { token, user } = response as { token: string; user: User };
          
          this.authService.setToken(token);
          const userData : string = JSON.stringify(user);
          localStorage.setItem('user', userData);
          this.authService.setUser(userData);

          this.router.navigate(['/']);

          InfoboxUtil.showInfoBox({
            message: 'Successfully logged in!',
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
