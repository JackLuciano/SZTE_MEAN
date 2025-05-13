import { signal } from '@angular/core';
import { InfoboxService, InfoboxMessage } from '../services/infobox.service';

export class InfoboxUtil {
    private static infoboxService = signal<InfoboxService | null>(null);

    static initialize(service: InfoboxService): void {
        this.infoboxService.set(service);
    }

    static showMessage(message: InfoboxMessage): void {
        const infoboxService: InfoboxService | null = this.infoboxService();
        if (!infoboxService) 
            return;
        
        infoboxService.show(message);
    }
}