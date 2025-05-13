import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Item } from '../models/item';
import { HttpClient } from '@angular/common/http';
import { getAPIUrl } from '../../app.config';
import { User } from '../models/user';
import { ItemComponent } from '../cards/item/item.component';

@Component({
  selector: 'app-my-items',
  imports: [CommonModule, ItemComponent],
  templateUrl: './my-items.component.html',
  styleUrl: './my-items.component.scss'
})
export class MyItemsComponent implements OnInit {
  items = signal<Item[]>([]);
  sortedItems = signal<Item[]>([]);
  user = signal<User | null>(null);
  loadingItems = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient
  ) {
    effect(() => {
      const user = this.authService.userSignal();
      this.user.set(user);
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

    this.httpClient.get<Item[]>(getAPIUrl('items/my-items')).subscribe({
      next: (response: Item[]) => {
        this.items.set(response.map(item => new Item(item)));
        this.sortItems();
        this.loadingItems.set(false);
      }
    });
  };

  private sortItems(): void {
    this.sortedItems.set(this.items().sort((a, b) => a.price - b.price));
  }
}
