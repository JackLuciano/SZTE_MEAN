import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Item } from '../models/item';
import { API_URL } from '../../app.config';
import { DatePipe } from '../../pipes/date.pipe';

@Component({
  selector: 'app-item-display',
  imports: [DatePipe],
  templateUrl: './item-display.component.html',
  styleUrl: './item-display.component.scss'
})
export class ItemDisplayComponent implements OnInit {
  itemId: string | null = null;
  item: Item | undefined;

  constructor(private route: ActivatedRoute, private router: Router, private httpClient: HttpClient) {}

  ngOnInit() {
    this.itemId = this.route.snapshot.paramMap.get('id') || null;

    this.httpClient.get<Item>(API_URL + 'items/' + this.itemId)
      .subscribe({
        next: (response: Item) => {
          this.item = new Item(response);
        },
        error: (error) => {
          console.error('Error fetching item:', error);
          this.router.navigate(['/']);
        }
      });
  }
}
