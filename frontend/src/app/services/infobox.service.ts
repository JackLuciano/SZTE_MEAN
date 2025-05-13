import { computed, Injectable, signal } from '@angular/core';

export interface InfoboxMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class InfoboxService {
  private infoboxSignalInternal = signal<InfoboxMessage[]>([]);

  constructor() {
    this.infoboxSignalInternal.set([]);
  }

  messages = computed(() => this.infoboxSignalInternal());

  show(message: InfoboxMessage): void {
    this.infoboxSignalInternal.set([...this.infoboxSignalInternal(), message]);
  }

  remove(index: number): void {
    this.infoboxSignalInternal.set(this.infoboxSignalInternal().filter((_, i) => i !== index));
  }

  removeAll(): void {
    this.infoboxSignalInternal.set([]);
  }
}