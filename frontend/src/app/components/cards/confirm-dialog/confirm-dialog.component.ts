import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent implements OnInit {
  @Input() message! : string;
  @Input() confirmButtonText : string = 'Confirm';
  @Input() cancelButtonText : string = 'Cancel';

  @Output() confirm : EventEmitter<void> = new EventEmitter<void>();
  @Output() cancel : EventEmitter<void> = new EventEmitter<void>();

  ngOnInit() : void {}

  onConfirm() : void {
    this.confirm.emit();
  }

  onCancel() : void {
    this.cancel.emit();
  }
}
