import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { AddB2bBannerFormComponent } from 'src/app/add-b2b-banner-form/add-b2b-banner-form.component';
import { ApiService } from 'src/app/services/api/api.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss']
})
export class BannersComponent implements OnInit,OnDestroy {

ref:DynamicDialogRef | undefined;
  isLoading:boolean = false;
  bannerData:any[] = [];
  bannerKeys:any[] = [];

  bannerAddedSub:Subscription | undefined;

  constructor(private apiService:ApiService , private toastr:ToastrService , private dialogService:DialogService , private utilityService:UtilityService){}

  ngOnInit()
  {
    this.isLoading = true;
    this.getBanners();
    this.utilityService.bannerAdded.subscribe((_)=>{
      this.getBanners();
      this.ref?.close();
    });
  }

  getBanners()
  {
    this.isLoading = true;
    this.apiService.getB2bBanners().subscribe((banners)=>{
      if(banners == null)
      {
        this.bannerData = [];
        this.bannerKeys = [];
        this.isLoading = false;
        return;
      }
      this.bannerData = Object.values(banners);
      this.bannerKeys = Object.keys(banners);
      this.isLoading = false;
    });
  }

  deleteBanner(index:number)
  {
    this.isLoading = true;
    this.apiService.deleteB2BBanner(this.bannerKeys[index]).subscribe((_:any)=>{
      this.toastr.success('Banner Deleted Successfully', 'Notification!' , {
        timeOut : 4000 ,
        closeButton : true , 
        positionClass : 'toast-bottom-right'
      });
      this.getBanners();
    });
  }

  onAddBanner()
  {
    this.ref = this.dialogService.open(AddB2bBannerFormComponent, { 
      header: 'Add a b2b banner',
      maximizable:true,
      height : "800px", 
      width:"600px",
  });
  }

  ngOnDestroy()
  {
    this.bannerAddedSub?.unsubscribe();
  }

}
