import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryRouteMakerComponent } from './delivery-route-maker.component';

describe('DeliveryRouteMakerComponent', () => {
  let component: DeliveryRouteMakerComponent;
  let fixture: ComponentFixture<DeliveryRouteMakerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeliveryRouteMakerComponent]
    });
    fixture = TestBed.createComponent(DeliveryRouteMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
