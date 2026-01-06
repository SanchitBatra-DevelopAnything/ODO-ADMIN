import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditKhokhaItemComponent } from './edit-khokha-item.component';

describe('EditKhokhaItemComponent', () => {
  let component: EditKhokhaItemComponent;
  let fixture: ComponentFixture<EditKhokhaItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditKhokhaItemComponent]
    });
    fixture = TestBed.createComponent(EditKhokhaItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
