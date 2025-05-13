import { Component, OnInit } from '@angular/core';
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
  items: Item[] = [];
  sortedItems: Item[] = [];
  user: User | null = null;
  loadingItems: boolean = true;

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient
  ) {}

  ngOnInit(): void {
    this.subscribeToUser();
    this.fetchItems();
  }

  private subscribeToUser(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.sortItems();
    });
  };
  
  fetchItems(): void {
    this.loadingItems = true;
    this.items = [];
    this.sortedItems = [];

    this.httpClient.get<Item[]>(getAPIUrl('items/my-items')).subscribe({
      next: (response: Item[]) => {
        this.items = response.map(item => new Item(item));
        console.log(this.items)
        this.sortItems();
        this.loadingItems = false;
      }
    });
  };

  private sortItems(): void {
    this.sortedItems = this.items.sort((a, b) => a.price - b.price);
  }
}
