import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KhokhaOrdersComponent } from './khokha-orders.component';

describe('KhokhaOrdersComponent', () => {
  let component: KhokhaOrdersComponent;
  let fixture: ComponentFixture<KhokhaOrdersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KhokhaOrdersComponent]
    });
    fixture = TestBed.createComponent(KhokhaOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
