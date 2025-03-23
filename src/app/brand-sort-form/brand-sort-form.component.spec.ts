import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandSortFormComponent } from './brand-sort-form.component';

describe('BrandSortFormComponent', () => {
  let component: BrandSortFormComponent;
  let fixture: ComponentFixture<BrandSortFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BrandSortFormComponent]
    });
    fixture = TestBed.createComponent(BrandSortFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
