import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDeliveryPartnerFormComponent } from './add-delivery-partner-form.component';

describe('AddDeliveryPartnerFormComponent', () => {
  let component: AddDeliveryPartnerFormComponent;
  let fixture: ComponentFixture<AddDeliveryPartnerFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddDeliveryPartnerFormComponent]
    });
    fixture = TestBed.createComponent(AddDeliveryPartnerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
