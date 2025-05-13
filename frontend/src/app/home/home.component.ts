import { Component, OnInit, signal, effect } from '@angular/core';
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
  items = signal<Item[]>([]);
  sortedItems = signal<Item[]>([]);
  categories = signal<Category[]>(categories);
  selectedCategory = signal<Category>(categories[0]);
  loadingItems = signal<boolean>(true);
  user = signal<User | null>(null);

  constructor(private authService: AuthService, private httpClient: HttpClient) {
    effect(() => {
      this.user.set(this.authService.userSignal());
      this.sortItems();
    });
  }

  ngOnInit(): void {
    this.fetchItems();
  }

  fetchItems(): void {
    this.loadingItems.set(true);
    this.items.set([]);
    this.sortedItems.set([]);

    this.httpClient.get<Item[]>(getAPIUrl('items')).subscribe({
      next: (response: Item[]) => {
        this.items.set(response.map(item => new Item(item)));
        this.sortItems();
        this.loadingItems.set(false);
      }
    });
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory.set(this.categories().find(category => category._id === categoryId) || this.categories()[0]);
    this.sortItems();
  }

  private sortItems(): void {
    this.sortedItems.set(this.items()
      .filter(item => item.category._id === this.selectedCategory()._id)
      .sort((a, b) => a.price - b.price));

    if (this.user) {
      this.sortedItems().sort(item => (item.ownerId === this.user()?.userId ? -1 : 1));
    }
  }
}
