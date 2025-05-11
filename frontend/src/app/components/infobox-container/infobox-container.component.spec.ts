import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoboxContainerComponent } from './infobox-container.component';

describe('InfoboxContainerComponent', () => {
  let component: InfoboxContainerComponent;
  let fixture: ComponentFixture<InfoboxContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoboxContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoboxContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
