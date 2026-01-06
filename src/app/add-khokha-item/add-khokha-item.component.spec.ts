import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddKhokhaItemComponent } from './add-khokha-item.component';

describe('AddKhokhaItemComponent', () => {
  let component: AddKhokhaItemComponent;
  let fixture: ComponentFixture<AddKhokhaItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddKhokhaItemComponent]
    });
    fixture = TestBed.createComponent(AddKhokhaItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
