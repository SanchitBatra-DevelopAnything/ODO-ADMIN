import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UtilityService } from './services/utility/utility.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'odo-admin';
  showHeaderSub:Subscription = new Subscription();
  showHeader:boolean = true;

  constructor(private utilityService:UtilityService){}

  ngOnInit()
  {
    this.showHeaderSub = this.utilityService.userLoggedIn.subscribe((show)=>{
      this.showHeader = show;
    });
  }

  ngOnDestroy()
  {
    this.showHeaderSub.unsubscribe();
  }
}
