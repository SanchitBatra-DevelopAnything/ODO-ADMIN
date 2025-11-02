import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../services/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from '../services/utility/utility.service';

@Component({
  selector: 'app-add-admin-form',
  templateUrl: './add-admin-form.component.html',
  styleUrls: ['./add-admin-form.component.scss']
})
export class AddAdminFormComponent {
  adminForm: FormGroup;
  darkStores: any[] = [];
  darkStoreKeys:any[] = [];
  isLoading:boolean = false;

  constructor(private fb: FormBuilder, private apiService:ApiService , private toastr:ToastrService , private utilityService:UtilityService) {
    this.adminForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      darkStoreId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.fetchDarkStores();
  }

  fetchDarkStores() {
  this.apiService.getDarkStores().subscribe((darkStoresData)=>{
    if(darkStoresData == null)
    {
      this.darkStores=[];
      this.isLoading = false;
      return;
    }
    this.darkStores = Object.values(darkStoresData);
    this.darkStoreKeys = Object.keys(darkStoresData);
    this.isLoading = false;
  });
  }

  onSubmit() {
    console.log(this.adminForm.value);
    this.isLoading = true;
    if (this.adminForm.valid) {
      const adminData = {
        'username' : this.adminForm.value.username,
        'password' : this.adminForm.value.password,
        'darkStoreId' : this.adminForm.value.darkStoreId,
        'type': 'Sub'
      };

     this.apiService.addAdmin(adminData).subscribe(()=>{
      this.isLoading = false;
      this.utilityService.adminAdded.next(true);
        this.isLoading = false;
        this.toastr.success('SubAdmin Added Successfully , Please close the form!', 'Notification!' , {
          timeOut : 4000 ,
          closeButton : true , 
          positionClass : 'toast-top-right'
        });
        this.adminForm.reset();
     });
    }
  }
}
