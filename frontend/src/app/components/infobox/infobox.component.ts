import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-infobox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './infobox.component.html',
  styleUrl: './infobox.component.scss',
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', 
          style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class InfoboxComponent implements OnInit, OnDestroy {
  @Input() message!: string;
  @Input() type: 'success' | 'error' | 'info' | 'warning' = 'info';
  @Input() icon?: string;
  @Input() duration: number = 5000;
  @Output() closed = new EventEmitter<void>();

  progressWidth: number = 0;
  private timer: any;
  private progressInterval: any;

  private startTimer(): void {
    const startTime = Date.now();
    const endTime = startTime + this.duration;

    this.progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      this.progressWidth = Math.min(100, (elapsed / this.duration) * 100);
      
      if (elapsed >= this.duration) {
        this.cleanUp();
        this.closed.emit();
      }
    }, 16);

    this.timer = setTimeout(() => {
      this.cleanUp();
      this.closed.emit();
    }, this.duration);
  }

  private cleanUp(): void {
    clearInterval(this.progressInterval);
    clearTimeout(this.timer);
  }

  ngOnInit(): void {
    if (!this.message) {
      this.closed.emit();

      return;
    }
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.cleanUp();
  }

  close(): void {
    this.cleanUp();
    this.closed.emit();
  }
}
