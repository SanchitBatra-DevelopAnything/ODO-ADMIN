import { Component } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from '../services/api/api.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from '../services/utility/utility.service';

@Component({
  selector: 'app-add-dark-store',
  templateUrl: './add-dark-store.component.html',
  styleUrls: ['./add-dark-store.component.scss']
})
export class AddDarkStoreComponent {
  ref:DynamicDialogRef | undefined;
    isLoading:boolean = false;
    addDarkStoreForm:any;
  
    constructor(private apiService:ApiService , private formBuilder:FormBuilder , private toastr:ToastrService , private utilityService:UtilityService,private dialogService:DialogService){}
  
    ngOnInit()
    {
      this.addDarkStoreForm = this.formBuilder.group({
        darkStoreName: ['', Validators.required],
      });
    }
  
    onSubmit(formValue : any)  {
      if (this.addDarkStoreForm.valid) {
        this.isLoading = true;
        this.apiService.addDarkStore(this.addDarkStoreForm.value).subscribe((_:any)=>{
          this.utilityService.darkStoreAdded.next(true);
          this.isLoading = false;
          this.toastr.success('DarkStore Added Successfully , Please close the form!', 'Notification!' , {
            timeOut : 4000 ,
            closeButton : true , 
            positionClass : 'toast-top-right'
          });
          this.addDarkStoreForm.reset();
        });
      }
    }
  
    ngOnDestroy(): void {
      this.utilityService.areaAdded.unsubscribe();
    }
}
