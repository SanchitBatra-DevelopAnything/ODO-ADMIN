import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandOnboardComponent } from './brand-onboard.component';

describe('BrandOnboardComponent', () => {
  let component: BrandOnboardComponent;
  let fixture: ComponentFixture<BrandOnboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BrandOnboardComponent]
    });
    fixture = TestBed.createComponent(BrandOnboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
