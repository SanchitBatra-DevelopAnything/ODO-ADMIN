import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddB2bBannerFormComponent } from './add-b2b-banner-form.component';

describe('AddB2bBannerFormComponent', () => {
  let component: AddB2bBannerFormComponent;
  let fixture: ComponentFixture<AddB2bBannerFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddB2bBannerFormComponent]
    });
    fixture = TestBed.createComponent(AddB2bBannerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
