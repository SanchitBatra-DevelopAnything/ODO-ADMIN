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

  onApprove(index:any)
  {
    this.isLoading = true;

    this.apiService.deleteNotification(this.notificationKeys[index]).subscribe((_)=>{
      this.apiService.makeUser(this.notificationData[index]).subscribe((_)=>{
        console.log("User Made Successfully");
        console.log(this.notificationData[index]);
        //used firebaseSDK to increment the count atomically.
        update(ref(this.db, `ReferralLeaderboard/${this.notificationData[index].referrerId}`), {
          referrals: increment(1)
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
