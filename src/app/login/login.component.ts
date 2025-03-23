import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api/api.service';
import { UtilityService } from '../services/utility/utility.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  isLoading:boolean = false;
  isMaintenanceWindow:boolean = false;
  isLoginWindow:boolean = false;
  activeSkipButton:boolean = false;
  admins : any = [];
  skipMaintenanceSub:Subscription = new Subscription();
  loginForm:UntypedFormGroup = new UntypedFormGroup({

  });

  constructor(private apiService:ApiService , private utilityService:UtilityService , private router:Router) { }

  ngOnInit(): void {
    this.utilityService.userLoggedIn.next(false);
    this.loginForm = new UntypedFormGroup({
      'username' : new UntypedFormControl(null), 
      'password' : new UntypedFormControl(null)
    });
    this.isLoading = true;
    this.getAdmins();
    this.getMaintenanceInformation();
    this.skipMaintenanceSub = this.utilityService.skippedMaintenance.subscribe((data)=>{
      this.isMaintenanceWindow = !data;
      this.isLoginWindow = data;
      this.activeSkipButton = false;
    });
  } 

  getMaintenanceInformation()
  {
    this.apiService.checkMaintenance().subscribe((data)=>{
      if(data == null)
      {
        this.isLoginWindow = true;
        this.isMaintenanceWindow = false;
        this.activeSkipButton = false;
        this.isLoading = false;
        return;
      }
      this.activeSkipButton = data['showMessage'];
      this.isMaintenanceWindow = data['off'];
      this.isLoginWindow = !data['off'];
      this.isLoading = false;
    });
  }

  getAdmins() : void
  {
    this.isLoading = true;
    this.apiService.getAdmins().subscribe((adminData)=>{
      if(adminData == null)
      {
        this.admins = [];
        this.isLoading = false;
      }
      this.admins = adminData;
      this.isLoading = false;
    });
  }

  onSubmit()
  {
    let adminIndex = this.isAdminRegistered(this.loginForm.value.username);
    let arr : {username : string , password : string}[];
    arr = Object.values(this.admins);
    if(adminIndex!=-1)
    {
      if(arr[adminIndex].password != this.loginForm.value.password)
      {
        alert('invalid password');
        return;
      }
      this.loginSuccessfull(adminIndex);
    }
    else
    {
      alert('Sorry , you are not registered!');
    }
  }

  isAdminRegistered(adminName:string) : number
  {
    let arr : {username : string , password : string}[];
    arr = Object.values(this.admins);
    for(let i=0;i<arr.length;i++)
    {
      if(arr[i].username.trim() == adminName.trim())
      {
        return i;
      }
    }
    return -1;
  }

  loginSuccessfull(adminIndex:any)
  {
    let arr = Object.values(this.admins);
    let currentAdmin : any = arr[adminIndex];
    sessionStorage.setItem("loggedInUser" , this.loginForm.value.username);
    sessionStorage.setItem("loggedIn" , "true");
    sessionStorage.setItem("adminType" , currentAdmin.type);
    //super admin has no area but type = Super , each sub-admin has an area.
    sessionStorage.setItem("loggedInArea" , currentAdmin.area);
    this.utilityService.userLoggedIn.next(true); //inform app component ki header on kardo.
    if(sessionStorage.getItem('adminType')!='Sub')
    {
      this.router.navigate(['/categories']);
    }
    else
    {
      this.router.navigate(['/dailyReport']);
    }

  }

  ngOnDestroy()
  {
    this.skipMaintenanceSub.unsubscribe();
  }

}
