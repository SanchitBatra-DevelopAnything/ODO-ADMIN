import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDarkStoreComponent } from './add-dark-store.component';

describe('AddDarkStoreComponent', () => {
  let component: AddDarkStoreComponent;
  let fixture: ComponentFixture<AddDarkStoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddDarkStoreComponent]
    });
    fixture = TestBed.createComponent(AddDarkStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
