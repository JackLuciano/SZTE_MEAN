import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Item } from '../models/item';
import { API_URL } from '../../app.config';
import { DatePipe } from '../../pipes/date.pipe';
import { AuthService } from '../../services/auth.service';
import { User } from '../models/user';

@Component({
  selector: 'app-item-display',
  imports: [DatePipe],
  templateUrl: './item-display.component.html',
  styleUrl: './item-display.component.scss'
})
export class ItemDisplayComponent implements OnInit {
  itemId: string | null = null;
  item: Item | undefined;
  buttons: any[] = [
    { icon: "✉️", class: "message", name: "Message the seller", click: () => {} },
    { icon: "🛒", class:"buy", name: "Buy now", click: () => {} },
  ];

  isAuthenticated: boolean = false;
  user: User | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private httpClient: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.authService.authenticated$.subscribe((authenticated: boolean) => {
      this.isAuthenticated = authenticated;
    });

    this.authService.user$.subscribe((user) => {
      this.user = user;
    });

    this.itemId = this.route.snapshot.paramMap.get('id') || null;

    this.httpClient.get<Item>(API_URL + 'items/' + this.itemId)
      .subscribe({
        next: (response: Item) => {
          this.item = new Item(response);

          if (this.user && this.item) {
            if (this.user.userId == this.item.ownerId) {
              this.buttons = [
                { icon: "🗑️", class: "delete", name: "Delete item", click: () => {} },
              ];
            }
          }
        },
        error: (error) => {
          console.error('Error fetching item:', error);
          this.router.navigate(['/']);
        }
      });
  }
}
