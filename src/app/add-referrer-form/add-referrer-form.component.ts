import { Component } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from '../services/api/api.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from '../services/utility/utility.service';

@Component({
  selector: 'app-add-referrer-form',
  templateUrl: './add-referrer-form.component.html',
  styleUrls: ['./add-referrer-form.component.scss']
})
export class AddReferrerFormComponent {
  ref:DynamicDialogRef | undefined;
    isLoading:boolean = false;
    addReferrerForm:any;
  
    constructor(private apiService:ApiService , private formBuilder:FormBuilder , private toastr:ToastrService , private utilityService:UtilityService,private dialogService:DialogService){}
  
    ngOnInit()
    {
      this.addReferrerForm = this.formBuilder.group({
        referrerName: ['', Validators.required],
      });
    }
  
    onSubmit(formValue : any)  {
      if (this.addReferrerForm.valid) {
        this.isLoading = true;
        this.apiService.addReferrer({...this.addReferrerForm.value , "referrals" : 0}).subscribe((_:any)=>{
          this.utilityService.referrerAdded.next(true);
          this.isLoading = false;
          this.toastr.success('Added Referrer Successfully , Please close the form!', 'Notification!' , {
            timeOut : 4000 ,
            closeButton : true , 
            positionClass : 'toast-top-right'
          });
          this.addReferrerForm.reset();
        });
      }
    }
  
    ngOnDestroy(): void {
      this.utilityService.areaAdded.unsubscribe();
    }
}
