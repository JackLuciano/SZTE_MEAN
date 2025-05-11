import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface InfoboxMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class InfoboxService {
  private infoboxSubject = new BehaviorSubject<InfoboxMessage[]>([]);
  message$ = this.infoboxSubject.asObservable();

  show(message: InfoboxMessage) : void {
    const currentMessages = this.infoboxSubject.value;
    const newMessage = {
      ...message
    };
    this.infoboxSubject.next([...currentMessages, newMessage]);
  }

  remove(index: number) : void {
    const messages = this.infoboxSubject.value;
    messages.splice(index, 1);
    this.infoboxSubject.next([...messages]);
  }

  removeAll() : void {
    this.infoboxSubject.next([]);
  }
}
