import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OldOrderDetailComponent } from './old-order-detail.component';

describe('OldOrderDetailComponent', () => {
  let component: OldOrderDetailComponent;
  let fixture: ComponentFixture<OldOrderDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OldOrderDetailComponent]
    });
    fixture = TestBed.createComponent(OldOrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
