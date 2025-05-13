import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Item } from '../models/item';
import { getAPIUrl } from '../../app.config';
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
    this.httpClient.get<Item>(getAPIUrl(`items/${itemId}`)).subscribe({
      next: item => this.handleItemResponse(item),
      error: (error) => this.navigateToHome(error)
    });
  }

  private handleItemResponse(item : Item) : void {
    this.item = new Item(item);
    this.setupButtons();
  }

  private setupButtons() : void {
    if (this.user && this.item) {
      const isSold = this.item.isSold;
      const isDeleted = this.item.isDeleted;
      if (!isSold && !isDeleted) {
        this.buttons = this.user.userId === this.item.ownerId
        ? this.getOwnerButtons()
        : this.getDefaultButtons();
      }

    }
  }

  private getDefaultButtons() : any[] {
    return [
      { icon: "✉️", class: "message", name: "Message the seller", click: () => {} },
      { icon: "🛒", class: "buy", name: "Buy now", click: () => this.confirmBuy() }
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

  private confirmBuy() : void {
    this.showConfirmation = [
      {
        message: "Are you sure you want to buy this item? This action cannot be undone.",
        confirmButtonText: "Buy",
        cancelButtonText: "Cancel",
        confirm: () => this.buyItem(),
        cancel: () => (this.showConfirmation = null)
      }
    ];
  }

  private buyItem() : void {
    if (!this.itemId) return;

    this.httpClient.post(getAPIUrl(`items/buy/${this.itemId}`), {})
      .pipe(finalize(() => (this.showConfirmation = null)))
      .subscribe({
        next: response => this.handleSuccess(response),
        error: error => this.handleError(error)
    });
  }

  private deleteItem() : void {
    if (!this.itemId) return;

    this.httpClient
      .delete(getAPIUrl(`items/${this.itemId}`))
      .pipe(finalize(() => (this.showConfirmation = null)))
      .subscribe({
        next: response => this.handleSuccess(response),
        error: error => this.handleError(error)
    });
  }

  private handleSuccess(response: any) : void {
    InfoboxUtil.showMessage({
      message: response.message,
      type: 'success',
      duration: 3000
    });
    this.navigateToHome();
  }

  private handleError(error : any) : void {
    const message = error.error?.message || 'An error occurred';
    InfoboxUtil.showMessage({
      message,
      type: 'error',
      duration: 3000
    });
  }

  private navigateToHome(error?: any) : void {
    const message = error?.error?.message;
    if (message) {
      InfoboxUtil.showMessage({
        message,
        type: 'error',
        duration: 3000
      });
    }

    this.router.navigate(['/']);
  }
}
