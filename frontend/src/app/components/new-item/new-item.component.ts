import { Component, OnInit, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getAPIUrl } from '../../app.config';
import { InfoboxUtil } from '../../utils/infobox-util';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Category } from '../models/categories';
import { categories } from '../../data/categories';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-item',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './new-item.component.html',
  styleUrl: './new-item.component.scss'
})
export class NewItemComponent implements OnInit {
  newItemForm = signal<FormGroup | null>(null);
  selectedFiles = signal<File[]>([]);
  message = signal<string | null>(null);
  categories = signal<Category[]>([]);

  constructor(
    private httpClient : HttpClient, 
    private router: Router, 
    private formBuilder: FormBuilder
  ) {}

  private initializeForm() : void {
    this.newItemForm.set(this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      location: ['', [Validators.required]],
      tags: this.formBuilder.array([]),
    }))
  }
  ngOnInit() : void {
    this.initializeForm();
    this.categories.set(categories);
  }

  private createFormData() : FormData {
    const formData = new FormData();
    const { name, description, price, category, location } = this.newItemForm()?.value;

    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', categories[category].slug);
    formData.append('location', location);

    this.selectedFiles().forEach(file => {
      formData.append('files', file);
    });

    this.tagsFormArray.controls.forEach((control) => {
      formData.append('tags[]', control.value);
    });

    return formData;
  }

  onSubmit() : void {
    if (this.newItemForm()?.invalid) {
      this.displayMessage('Please fill in all required fields.');
      return;
    }

    const formData = this.createFormData();
    this.createItem(formData);
  }

  private createItem(formData: FormData) : void {
    this.httpClient.post(getAPIUrl(`items/create`), formData).subscribe({
      next: (response) => {
        this.handleSuccess(response);
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  onFilesSelected(event: Event) : void {
    const fileInput = event.target as HTMLInputElement;
    this.selectedFiles.set(Array.from(fileInput.files || []));
  }

  get tagsFormArray() : FormArray {
    return this.newItemForm()?.get('tags') as FormArray;
  }

  addTag(input: HTMLInputElement) : void {
    const value = input.value.trim();
    const maxTags = 10;
    if (this.tagsFormArray.length >= maxTags) {
      this.displayMessage(`You can only add up to ${maxTags} tags.`);

      return;
    }

    if (value && !this.tagsFormArray.value.includes(value)) {
      this.tagsFormArray.push(this.formBuilder.control(value));
    }
    input.value = '';
  }
  removeTag(index: number) : void {
    this.tagsFormArray.removeAt(index);
  }

  private handleSuccess(response: any) : void {
    InfoboxUtil.showMessage({
      message: response.message,
      type: 'success',
      duration: 3000,
    });
    this.router.navigate(['/']);
  }
  private handleError(error: any) : void {
    InfoboxUtil.showMessage({
      message: error.error?.message || 'Unauthorized',
      type: 'error',
      duration: 3000,
    });
  }

  private displayMessage(message: string) : void {
    this.message.set(message);
    setTimeout(() => {
      this.message.set(null);
    }, 3000);
  }
}
