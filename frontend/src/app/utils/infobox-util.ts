import { InfoboxService, InfoboxMessage } from '../services/infobox.service';

export class InfoboxUtil {
    private static infoboxService: InfoboxService | null = null;

    static initialize(service: InfoboxService): void {
        this.infoboxService = service;
    }

    static showMessage(message: InfoboxMessage): void {
        if (!this.infoboxService) {
            return;
        }
        this.infoboxService.show(message);
    }
}