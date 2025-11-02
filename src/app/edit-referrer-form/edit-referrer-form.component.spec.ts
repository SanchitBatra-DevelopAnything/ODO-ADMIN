import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReferrerFormComponent } from './edit-referrer-form.component';

describe('EditReferrerFormComponent', () => {
  let component: EditReferrerFormComponent;
  let fixture: ComponentFixture<EditReferrerFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditReferrerFormComponent]
    });
    fixture = TestBed.createComponent(EditReferrerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
