import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  isLoading:boolean = false;
  notificationData:any;
  notificationKeys:any;
  leaderBoardData:any;



  constructor(private apiService:ApiService , private toastr : ToastrService){}

  ngOnInit()
  {
    this.loadNotifications();
    this.loadReferralLeaderboard();
  }

  loadReferralLeaderboard()
  {
    this.isLoading = true;
    this.apiService.getReferralLeaderboardData().subscribe((data)=>{
      if(data == null)
      {
        this.leaderBoardData = [];
        this.isLoading = false;
        return;
      }
      else
      {
        this.leaderBoardData = Object.values(data);
        this.isLoading = false;
        return;
      }
    }
    );
  }

  loadNotifications()
  {
    this.isLoading = true;
    this.apiService.getNotificationRequests().subscribe((allNotis)=>{
      if(allNotis == null)
      {
        this.notificationData = [];
        this.notificationKeys = [];
        this.isLoading = false;
        return;
      }
      else
      {
        this.notificationData = Object.values(allNotis);
        this.notificationKeys = Object.keys(allNotis);
        this.isLoading = false;
        return;
      }
    });
  }

  onApprove(index:any)
  {
    this.isLoading = true;

    this.apiService.deleteNotification(this.notificationKeys[index]).subscribe((_)=>{
      this.apiService.makeUser(this.notificationData[index]).subscribe((_)=>{
        const referrer = this.leaderBoardData.find((r:any) => r.referrerName.toLowerCase() === this.notificationData[index].referrer.toLowerCase());
        if (referrer) {
          referrer.referrals += 1;
          this.apiService.updateReferralLeaderboardData(this.leaderBoardData).subscribe((_)=>{
            this.loadNotifications();
            this.toastr.success('Request Approved Successfully , Leaderboard Updated accordingly!', 'Notification!' , {
              timeOut : 4000 ,
              closeButton : true , 
              positionClass : 'toast-top-right'
            });
          }
          );
        }
        else
        {
          this.loadNotifications();
          this.toastr.success('Request Approved Successfully , No referrer catched , leaderboard not updated!', 'Notification!' , {
            timeOut : 4000 ,
            closeButton : true , 
            positionClass : 'toast-top-right'
          });
        }
       
      });
    });
  }

  onReject(index:any)
  {
    this.isLoading = true;
    this.apiService.deleteNotification(this.notificationKeys[index]).subscribe((_)=>{
      this.loadNotifications();
      this.toastr.success('Request Rejected Successfully!', 'Notification!' , {
        timeOut : 4000 ,
        closeButton : true , 
        positionClass : 'toast-top-right'
      });
    });
  }

}
