import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api/api.service';
import { getDatabase, ref, update, increment } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';


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

  app = initializeApp(environment.firebaseConfig);
   db = getDatabase(this.app);



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

  onApprove(index: any) {
    this.isLoading = true;
  
    this.apiService.deleteNotification(this.notificationKeys[index]).subscribe(() => {
      this.apiService.makeUser(this.notificationData[index]).subscribe(() => {
  
        console.log("User Made Successfully");
        console.log(this.notificationData[index]);
  
        update(
          ref(this.db, `ReferralLeaderboard/${this.notificationData[index].referrerId}`),
          { referrals: increment(1) }
        )
        .then(() => {
          this.loadNotifications();
          this.toastr.success(
            'Referral Count Updated Successfully!',
            'Notification!',
            {
              timeOut: 4000,
              closeButton: true,
              positionClass: 'toast-top-right'
            }
          );
        })
        .catch(error => {
          this.loadNotifications();
          this.toastr.warning(
            'Could not update referral count!',
            'Notification!',
            {
              timeOut: 4000,
              closeButton: true,
              positionClass: 'toast-top-right'
            }
          );
        });
  
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
