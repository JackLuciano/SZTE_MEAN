import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Item } from '../models/item';
import { API_URL } from '../../app.config';
import { DatePipe } from '../../pipes/date.pipe';
import { AuthService } from '../../services/auth.service';
import { User } from '../models/user';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { finalize } from 'rxjs';
import { InfoboxUtil } from '../../utils/infobox-util';

@Component({
  selector: 'app-item-display',
  imports: [DatePipe, ConfirmDialogComponent],
  templateUrl: './item-display.component.html',
  styleUrl: './item-display.component.scss'
})
export class ItemDisplayComponent implements OnInit {
  itemId : string | null = null;
  item : Item | undefined;
  showConfirmation : any[] | null = null;
  buttons : any[] = [];
  isAuthenticated : boolean = false;
  user : User | null = null;

  constructor(
    private route : ActivatedRoute,
    private router : Router,
    private httpClient : HttpClient,
    private authService : AuthService
  ) {}

  ngOnInit() : void {
    this.subscribeToUser();
    this.loadItem();
  }

  private subscribeToUser() : void {
    this.authService.authenticated$.subscribe(authenticated => {
      this.isAuthenticated = authenticated;
    });

    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  private loadItem() : void {
    this.itemId = this.route.snapshot.paramMap.get('id');
    if (!this.itemId) {
      this.navigateToHome();
      return;
    }

    this.fetchItem(this.itemId);
  }

  private fetchItem(itemId : string) : void {
    this.httpClient.get<Item>(`${API_URL}items/${itemId}`).subscribe({
      next: item => this.handleItemResponse(item),
      error: () => this.navigateToHome()
    });
  }

  private handleItemResponse(item : Item) : void {
    this.item = new Item(item);
    this.setupButtons();
  }

  private setupButtons() : void {
    if (this.user && this.item) {
      this.buttons = this.user.userId === this.item.ownerId
        ? this.getOwnerButtons()
        : this.getDefaultButtons();
    }
  }

  private getDefaultButtons() : any[] {
    return [
      { icon: "✉️", class: "message", name: "Message the seller", click: () => {} },
      { icon: "🛒", class: "buy", name: "Buy now", click: () => {} }
    ];
  }

  private getOwnerButtons() : any[] {
    return [
      {
        icon: "🗑️",
        class: "delete",
        name: "Delete item",
        click: () => this.confirmDelete()
      }
    ];
  }

  private confirmDelete() : void {
    this.showConfirmation = [
      {
        message: "Are you sure you want to delete this item?",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        confirm: () => this.deleteItem(),
        cancel: () => (this.showConfirmation = null)
      }
    ];
  }

  private deleteItem() : void {
    if (!this.itemId) return;

    this.httpClient
      .delete(`${API_URL}items/${this.itemId}`)
      .pipe(finalize(() => (this.showConfirmation = null)))
      .subscribe({
        next: response => this.handleDeleteSuccess(response),
        error: error => this.handleDeleteError(error)
      });
  }

  private handleDeleteSuccess(response: any) : void {
    InfoboxUtil.showMessage({
      message: response.message,
      type: 'success',
      duration: 3000
    });
    this.navigateToHome();
  }

  private handleDeleteError(error : any) : void {
    const message = error.error?.message || 'An error occurred';
    InfoboxUtil.showMessage({
      message,
      type: 'error',
      duration: 3000
    });
  }

  private navigateToHome() : void {
    this.router.navigate(['/']);
  }
}
