import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DarkStoreComponent } from './dark-store.component';

describe('DarkStoreComponent', () => {
  let component: DarkStoreComponent;
  let fixture: ComponentFixture<DarkStoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DarkStoreComponent]
    });
    fixture = TestBed.createComponent(DarkStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
