import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReferrerFormComponent } from './add-referrer-form.component';

describe('AddReferrerFormComponent', () => {
  let component: AddReferrerFormComponent;
  let fixture: ComponentFixture<AddReferrerFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddReferrerFormComponent]
    });
    fixture = TestBed.createComponent(AddReferrerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
