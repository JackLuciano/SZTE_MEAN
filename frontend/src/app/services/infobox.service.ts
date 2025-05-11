import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface InfoboxMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class InfoboxService {
  private infoboxSubject = new BehaviorSubject<InfoboxMessage[]>([]);
  readonly message$ = this.infoboxSubject.asObservable();

  show(message: InfoboxMessage): void {
    const updatedMessages = [...this.infoboxSubject.value, message];
    this.infoboxSubject.next(updatedMessages);
  }

  remove(index: number): void {
    const updatedMessages = this.infoboxSubject.value.filter((_, i) => i !== index);
    this.infoboxSubject.next(updatedMessages);
  }

  removeAll(): void {
    this.infoboxSubject.next([]);
  }
}
