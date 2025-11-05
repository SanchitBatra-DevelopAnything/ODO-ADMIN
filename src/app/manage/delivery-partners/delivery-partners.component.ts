import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { AddDeliveryPartnerFormComponent } from 'src/app/add-delivery-partner-form/add-delivery-partner-form.component';
import { ApiService } from 'src/app/services/api/api.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-delivery-partners',
  templateUrl: './delivery-partners.component.html',
  styleUrls: ['./delivery-partners.component.scss']
})
export class DeliveryPartnersComponent implements OnInit , OnDestroy {
    ref:DynamicDialogRef | undefined;
      isLoading:boolean = false;
      deliveryPartnerData:any[] = [];
      deliveryPartnerKeys:any[] = [];
    
      deliveryPartnerAddedSub:Subscription | undefined;
    
      constructor(private apiService:ApiService , private toastr:ToastrService , private dialogService:DialogService , private utilityService:UtilityService){}
    
      ngOnInit()
      {
        this.isLoading = true;
        this.getDeliveryPartners();
        this.utilityService.deliveryPartnerAdded.subscribe((_)=>{
          this.getDeliveryPartners();
          this.ref?.close();
        });
      }
    
      getDeliveryPartners()
      {
        this.isLoading = true;
        this.apiService.getDeliveryPartners().subscribe((deliveryPartners)=>{
          if(deliveryPartners == null)
          {
            this.deliveryPartnerData = [];
            this.deliveryPartnerKeys = [];
            this.isLoading = false;
            return;
          }
          this.deliveryPartnerData = Object.values(deliveryPartners);
          this.deliveryPartnerKeys = Object.keys(deliveryPartners);
          this.isLoading = false;
        });
      }
    
      deleteDeliveryPartner(index:number)
      {
        this.isLoading = true;
        this.apiService.deleteDeliveryPartner(this.deliveryPartnerKeys[index]).subscribe((_:any)=>{
          this.toastr.success('Delivery Partner Deleted Successfully', 'Notification!' , {
            timeOut : 4000 ,
            closeButton : true , 
            positionClass : 'toast-bottom-right'
          });
          this.getDeliveryPartners();
        });
      }
    
      onAddDeliveryPartner()
      {
        this.ref = this.dialogService.open(AddDeliveryPartnerFormComponent, { 
          header: 'Add a delivery partner',
          maximizable:true,
          height : "800px",
          width:"600px",
      });
      }
    
      ngOnDestroy()
      {
        this.deliveryPartnerAddedSub?.unsubscribe();
      }
}
