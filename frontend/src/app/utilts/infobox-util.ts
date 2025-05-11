import { InfoboxService, InfoboxMessage } from '../services/infobox.service';

export class InfoboxUtil {
    private static infoboxService: InfoboxService;

    static init(infoboxService: InfoboxService) {
        this.infoboxService = infoboxService;
    }

    static showInfoBox(box: InfoboxMessage) {
        this.infoboxService?.show(box);
    }
}