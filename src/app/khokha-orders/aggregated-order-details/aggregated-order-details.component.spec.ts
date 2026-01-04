import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregatedOrderDetailsComponent } from './aggregated-order-details.component';

describe('AggregatedOrderDetailsComponent', () => {
  let component: AggregatedOrderDetailsComponent;
  let fixture: ComponentFixture<AggregatedOrderDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AggregatedOrderDetailsComponent]
    });
    fixture = TestBed.createComponent(AggregatedOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
