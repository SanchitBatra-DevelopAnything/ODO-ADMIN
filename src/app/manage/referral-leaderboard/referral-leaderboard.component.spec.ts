import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralLeaderboardComponent } from './referral-leaderboard.component';

describe('ReferralLeaderboardComponent', () => {
  let component: ReferralLeaderboardComponent;
  let fixture: ComponentFixture<ReferralLeaderboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReferralLeaderboardComponent]
    });
    fixture = TestBed.createComponent(ReferralLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
