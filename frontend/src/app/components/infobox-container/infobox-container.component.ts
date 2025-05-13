import { Component, OnInit, signal, effect } from '@angular/core';
import { InfoboxService } from '../../services/infobox.service';
import { InfoboxComponent } from '../infobox/infobox.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-infobox-container',
  imports: [CommonModule, InfoboxComponent],
  templateUrl: './infobox-container.component.html',
  styleUrl: './infobox-container.component.scss'
})
export class InfoboxContainerComponent implements OnInit {
  constructor(public infoboxService : InfoboxService) {
    effect(() => {
      this.infoboxes.set(this.infoboxService.messages());
    });
  }
  infoboxes = signal<any[]>([]);

  ngOnInit() : void {
    
  }

  removeMessage(index : number) : void {
    this.infoboxService.remove(index);
  }
}
