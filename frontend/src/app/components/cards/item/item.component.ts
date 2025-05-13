import { Component, Input } from '@angular/core';
import { Item } from '../../models/item';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item',
  imports: [],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss'
})
export class ItemComponent {
  @Input() item : Item | undefined;
  @Input() myItem : boolean = false;
  @Input() boughtItem: boolean = false;
  @Input() deletedItem: boolean = false;

  constructor(private router : Router) { }

  openItem(itemId: string) : void {
    this.router.navigate(['/item', itemId]);
  }
}
