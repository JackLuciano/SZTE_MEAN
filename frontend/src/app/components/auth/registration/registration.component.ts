import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { API_URL } from '../../../app.config';
import { InfoboxUtil } from '../../../utilts/infobox-util';

@Component({
  selector: 'app-registration',
  imports: [ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  selectedFile: File | null = null;
  message: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private httpClient: HttpClient
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registrationForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      secondName: ['', Validators.required],
      password: ['', Validators.required],
      password2: ['', Validators.required],
      picture: [''],
    });
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    this.selectedFile = fileInput.files ? fileInput.files[0] : null;
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.displayMessage('Please fill in all required fields.');
      return;
    }

    const { password, password2 } = this.registrationForm.value;
    if (password !== password2) {
      this.displayMessage('Passwords do not match.');
      return;
    }

    const formData = this.createFormData();
    this.registerUser(formData);
  }

  private createFormData(): FormData {
    const formData = new FormData();
    const { username, email, firstName, secondName, password, password2 } = this.registrationForm.value;

    formData.append('username', username);
    formData.append('email', email);
    formData.append('firstName', firstName);
    formData.append('secondName', secondName);
    formData.append('password', password);
    formData.append('password2', password2);

    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile, this.selectedFile.name);
    }

    return formData;
  }

  private registerUser(formData: FormData): void {
    this.httpClient.post(`${API_URL}auth/register`, formData, { headers: { 'skip-auth': 'true' } })
      .subscribe({
        next: (response: any) => this.handleSuccess(response),
        error: (error) => this.handleError(error),
      });
  }

  private handleSuccess(response: any): void {
    InfoboxUtil.showMessage({
      message: response.message,
      type: 'success',
      duration: 3000,
    });
    this.router.navigate(['/login']);
  }

  private handleError(error: any): void {
    InfoboxUtil.showMessage({
      message: error.error?.message || 'Unauthorized',
      type: 'error',
      duration: 3000,
    });
  }

  private displayMessage(message: string): void {
    this.message = message;
  }
}
