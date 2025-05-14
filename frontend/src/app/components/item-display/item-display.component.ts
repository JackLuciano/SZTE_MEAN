import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Item } from '../models/item';
import { getAPIUrl } from '../../app.config';
import { DatePipe } from '../../pipes/date.pipe';
import { AuthService } from '../../services/auth.service';
import { User } from '../models/user';
import { ConfirmDialogComponent } from '../cards/confirm-dialog/confirm-dialog.component';
import { finalize } from 'rxjs';
import { InfoboxUtil } from '../../utils/infobox-util';

@Component({
  selector: 'app-item-display',
  imports: [DatePipe, CommonModule, ConfirmDialogComponent],
  templateUrl: './item-display.component.html',
  styleUrl: './item-display.component.scss'
})
export class ItemDisplayComponent implements OnInit {
  itemId = signal<string | null>(null);
  item = signal<Item | null>(null);
  showConfirmation = signal<any[] | null>(null);
  buttons = signal<any[]>([]);
  isAuthenticated = signal(false);
  user = signal<User | null>(null);
  seller = signal<User | null>(null);
  sellerProfilePicture = signal<string | null>(null);
  canChange = signal(false);

  constructor(
    private route : ActivatedRoute,
    private router : Router,
    private httpClient : HttpClient,
    private authService : AuthService
  ) {
    effect(() => {
      const auth = this.authService.isAuthenticated();
      this.isAuthenticated.set(auth);
    });

    effect(() => {
      const user = this.authService.userSignal();
      this.user.set(user);
    });
  }

  ngOnInit() : void {
    this.loadItem();
  }

  private loadItem() : void {
    this.itemId.set(this.route.snapshot.paramMap.get('id'));

    const itemId = this.itemId();
    if (!itemId) {
      this.navigateToHome();
      return;
    }

    this.fetchItem(itemId);
  }

  private fetchItem(itemId : string) : void {
    this.httpClient.get<Item>(getAPIUrl(`items/${itemId}`)).subscribe({
      next: item => this.handleItemResponse(item),
      error: (error) => this.navigateToHome(error)
    });
  }

  private fetchSeller(ownerId: string) : void {
    this.httpClient.get<User>(getAPIUrl(`auth/user/${ownerId}`)).subscribe(user => this.handleSellerResponse(user));
  }

  private handleSellerResponse(user: User) : void {
    this.seller.set(User.fromJson(user));

    const profilePicture = user.profilePicture;
    if (profilePicture) {
      const imageId = profilePicture.split('/').pop();
      this.httpClient.get(getAPIUrl(`images/profile/${imageId}`), { responseType: 'blob' })
        .subscribe(blob => this.sellerProfilePicture.set(URL.createObjectURL(blob)),
      );
    }
  }

  private handleItemResponse(item : Item) : void {
    this.item.set(new Item(item));

    this.fetchSeller(item.ownerId);

    this.setupButtons();

    const user = this.user();
    if (user) {
      this.canChange.set(user.userId === item.ownerId || user.role === 'admin')
    }
  }

  private setupButtons() : void {
    const user = this.user();
    const item = this.item();
    if (user && item) {
      const isSold = item.isSold;
      const isDeleted = item.isDeleted;
      if (!isSold && !isDeleted) {
        this.buttons.set(user.userId === item.ownerId || user.role === 'admin'
        ? this.getOwnerButtons()
        : this.getDefaultButtons());
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
    this.showConfirmation.set([
      {
        message: "Are you sure you want to delete this item?",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        confirm: () => this.deleteItem(),
        cancel: () => (this.showConfirmation.set(null))
      }
    ]);
  }

  private confirmBuy() : void {
    this.showConfirmation.set([
      {
        message: "Are you sure you want to buy this item? This action cannot be undone.",
        confirmButtonText: "Buy",
        cancelButtonText: "Cancel",
        confirm: () => this.buyItem(),
        cancel: () => (this.showConfirmation.set(null))
      }
    ]);
  }

  private buyItem() : void {
    const itemId = this.itemId();
    if (!itemId) return;

    this.httpClient.post(getAPIUrl(`items/buy/${itemId}`), {})
      .pipe(finalize(() => (this.showConfirmation.set(null))))
      .subscribe({
        next: response => this.handleSuccess(response),
        error: error => this.handleError(error)
    });
  }

  private deleteItem() : void {
    const itemId = this.itemId();
    if (!itemId) return;

    this.httpClient
      .delete(getAPIUrl(`items/${itemId}`))
      .pipe(finalize(() => (this.showConfirmation.set(null))))
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

  // onEdit(name: string): void {
    
  // }
}
