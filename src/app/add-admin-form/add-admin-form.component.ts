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
  areas: any[] = [];
  areaKeys:any[] = [];
  isLoading:boolean = false;

  constructor(private fb: FormBuilder, private apiService:ApiService , private toastr:ToastrService , private utilityService:UtilityService) {
    this.adminForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      area: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.fetchAreas();
  }

  fetchAreas() {
  this.apiService.getDistributorships().subscribe((areaData)=>{
    if(areaData == null)
    {
      this.areas=[];
      this.isLoading = false;
      return;
    }
    this.areas = Object.values(areaData);
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
        'area' : this.adminForm.value.area,
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
