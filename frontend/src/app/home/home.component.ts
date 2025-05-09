import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Item } from '../components/models/item';
import { categories } from '../data/categories';
import { Category } from '../components/models/categories';
import { ItemComponent } from '../components/cards/item/item.component';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../app.config';

@Component({
  selector: 'app-home',
  imports: [ CommonModule, ItemComponent /*RouterLink*/ ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  items: Item[] = [];
  sortedItems: Item[] = [];
  categories : Category[] = categories;
  selectedCategory: Category = categories[0];

  constructor(private authService: AuthService, private httpClient: HttpClient) {}

  ngOnInit() : void {
    this.httpClient.get<Item[]>(API_URL + 'items')
      .subscribe({
        next: (response: Item[]) => {
          this.items = response.map(item => new Item(item));
          this.sortedItems = this.items.filter(item => item.category._id === this.selectedCategory._id);
          this.sortedItems.sort((a, b) => a.price - b.price);
        }
      });
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categories.find(category => category._id === categoryId) || categories[0];

    this.sortedItems = this.items.filter(item => item.category._id === this.selectedCategory._id);
    this.sortedItems.sort((a, b) => a.price - b.price);
  }
}
