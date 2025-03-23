import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributorAreasComponent } from './distributor-areas.component';

describe('DistributorAreasComponent', () => {
  let component: DistributorAreasComponent;
  let fixture: ComponentFixture<DistributorAreasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DistributorAreasComponent]
    });
    fixture = TestBed.createComponent(DistributorAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
