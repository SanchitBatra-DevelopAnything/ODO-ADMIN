import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KhokhaCategoriesComponent } from './khokha-categories.component';

describe('KhokhaCategoriesComponent', () => {
  let component: KhokhaCategoriesComponent;
  let fixture: ComponentFixture<KhokhaCategoriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KhokhaCategoriesComponent]
    });
    fixture = TestBed.createComponent(KhokhaCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
