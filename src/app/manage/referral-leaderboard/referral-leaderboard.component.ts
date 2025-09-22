import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { AddReferrerFormComponent } from 'src/app/add-referrer-form/add-referrer-form.component';
import { ApiService } from 'src/app/services/api/api.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-referral-leaderboard',
  templateUrl: './referral-leaderboard.component.html',
  styleUrls: ['./referral-leaderboard.component.scss']
})
export class ReferralLeaderboardComponent {

  ref:DynamicDialogRef | undefined;
    isLoading:boolean = false;
    referrerData:any[] = [];
    referrerKeys:any[] = [];
  
    referrerAddedSub:Subscription | undefined;
  
    constructor(private apiService:ApiService , private toastr:ToastrService , private dialogService:DialogService , private utilityService:UtilityService){}
  
    ngOnInit()
    {
      this.isLoading = true;
      this.getReferrers();
      this.referrerAddedSub = this.utilityService.referrerAdded.subscribe((_)=>{
        this.getReferrers();
        this.ref?.close();
      });
    }
  
    getReferrers()
    {
      this.isLoading = true;
      this.apiService.getReferralLeaderboardData().subscribe((referrers)=>{
        if(referrers == null)
        {
          this.referrerData = [];
          this.referrerKeys = [];
          this.isLoading = false;
          return;
        }
        this.referrerData = Object.values(referrers);
        this.referrerKeys = Object.keys(referrers);
        this.isLoading = false;
      });
    }
  
    onAddReferrer()
    {
      this.ref = this.dialogService.open(AddReferrerFormComponent, { 
        header: 'Add a referrer',
        maximizable:true,
        height : "800px",
        width:"600px",
    });
    }
  
    ngOnDestroy()
    {
      this.referrerAddedSub?.unsubscribe();
    }

}
