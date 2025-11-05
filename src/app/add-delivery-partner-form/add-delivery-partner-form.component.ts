import { Component } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from '../services/api/api.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from '../services/utility/utility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-delivery-partner-form',
  templateUrl: './add-delivery-partner-form.component.html',
  styleUrls: ['./add-delivery-partner-form.component.scss']
})
export class AddDeliveryPartnerFormComponent {
  ref:DynamicDialogRef | undefined;
    isLoading:boolean = false;
    addDeliveryPartnerForm:any;
  
    constructor(private apiService:ApiService , private formBuilder:FormBuilder , private toastr:ToastrService , private utilityService:UtilityService,private dialogService:DialogService){}
  
    ngOnInit()
    {
      this.addDeliveryPartnerForm = this.formBuilder.group({
        partnerName: ['', Validators.required],
        contact : ['' , Validators.required],
      });
    }
  
    onSubmit(formValue : any)  {
      if (this.addDeliveryPartnerForm.valid) {
        this.isLoading = true;
        this.apiService.addDeliveryPartner(this.addDeliveryPartnerForm.value).subscribe((_:any)=>{
          this.utilityService.deliveryPartnerAdded.next(true);
          this.isLoading = false;
          this.toastr.success('Delivery Partner Added Successfully , Please close the form!', 'Notification!' , {
            timeOut : 4000 ,
            closeButton : true , 
            positionClass : 'toast-top-right'
          });
          this.addDeliveryPartnerForm.reset();
        });
      }
    }
}
