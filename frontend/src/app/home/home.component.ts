import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Item } from '../components/models/item';
import { categories } from '../data/categories';
import { Category } from '../components/models/categories';
import { ItemComponent } from '../components/cards/item/item.component';
import { HttpClient } from '@angular/common/http';
import { getAPIUrl } from '../app.config';
import { User } from '../components/models/user';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ItemComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  items: Item[] = [];
  sortedItems: Item[] = [];
  categories: Category[] = categories;
  selectedCategory: Category = categories[0];
  loadingItems = true;
  user: User | null = null;

  constructor(private authService: AuthService, private httpClient: HttpClient) {}

  ngOnInit(): void {
    this.subscribeToUser();
    this.fetchItems();
  }

  private subscribeToUser(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.sortItems();
    });
  }

  fetchItems(): void {
    this.loadingItems = true;
    this.items = [];
    this.sortedItems = [];

    this.httpClient.get<Item[]>(getAPIUrl('items')).subscribe({
      next: (response: Item[]) => {
        this.items = response.map(item => new Item(item));
        this.sortItems();
        this.loadingItems = false;
      }
    });
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = this.categories.find(category => category._id === categoryId) || this.categories[0];
    this.sortItems();
  }

  private sortItems(): void {
    this.sortedItems = this.items
      .filter(item => item.category._id === this.selectedCategory._id)
      .sort((a, b) => a.price - b.price);

    if (this.user) {
      this.sortedItems.sort(item => (item.ownerId === this.user?.userId ? -1 : 1));
    }
  }
}
