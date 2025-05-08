import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { API_URL } from '../../../app.config';

@Component({
  selector: 'app-registration',
  imports: [ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  selectedFile: File | null = null;
  message = '';

  constructor(private fb: FormBuilder, private router: Router, private httpClient : HttpClient) {}

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;

    this.selectedFile = fileInput.files ? fileInput.files[0] : null;
  }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      secondName: ['', [Validators.required]],
      password: ['', Validators.required],
      password2: ['', Validators.required],
      picture: [''],
    });
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.message = 'Please fill in all required fields.';
      return;
    }
    
    const picture : File | null = this.selectedFile;
    const formData : FormData = new FormData();

    const { username, email, firstName, secondName, password, password2 } : { username: string; email: string; firstName: string; secondName: string; password: string; password2: string; } = this.registrationForm.value;
    
    if (password !== password2) {
      this.message = 'Passwords do not match.';
      return;
    }
    
    formData.append('username', username);
    formData.append('email', email);
    formData.append('firstName', firstName);
    formData.append('secondName', secondName);
    formData.append('password', password);
    formData.append('password2', password2);

    if (picture) {
      formData.append('profilePicture', picture, picture.name);
    }
    
    this.httpClient.post(API_URL + 'auth/register', formData)
      .subscribe({
        next: (response: any) => {
          const { message } = response as { message: string };

          this.message = message;

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.message = error.error?.message || 'Unauthorized';
        },
      });
  }
}
