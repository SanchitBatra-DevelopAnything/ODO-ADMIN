import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KhokhaItemListComponent } from './khokha-item-list.component';

describe('KhokhaItemListComponent', () => {
  let component: KhokhaItemListComponent;
  let fixture: ComponentFixture<KhokhaItemListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KhokhaItemListComponent]
    });
    fixture = TestBed.createComponent(KhokhaItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
