import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddAdminFormComponent } from 'src/app/add-admin-form/add-admin-form.component';
import { ApiService } from 'src/app/services/api/api.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-admins',
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.scss']
})
export class AdminsComponent implements OnInit , OnDestroy{

  isLoading:boolean = false;
  ref:DynamicDialogRef | undefined;
    
    adminData:any[] = [];
    adminKeys:any[] = [];
  constructor(private apiService:ApiService , private toastr:ToastrService , private dialogService:DialogService , private utilityService:UtilityService){}

  ngOnInit(): void {
    this.getAdmins();
    this.utilityService.adminAdded.subscribe((bool)=>{
      this.getAdmins();
      this.ref?.close();
    });
  }

  onAddAdmin()
  {
    this.ref = this.dialogService.open(AddAdminFormComponent, { 
          header: 'Add a sub-admin',
          maximizable:true,
          height : "800px",
          width:"600px",
      });
  }

  getAdmins() {
    this.isLoading = true;
    this.apiService.getAdmins().subscribe((admins: { [key: string]: { username: string, password: string, type: string, area: string } }) => {
      if (!admins) {
        this.adminData = [];
        this.adminKeys = [];
        this.isLoading = false;
        return;
      }
  
      // Convert object to array
      const allAdminData = Object.values(admins);
      const allAdminKeys = Object.keys(admins);
  
      // Filter only those admins where type === "Sub"
      const filteredAdmins = allAdminData.map((admin, index) => ({ admin, key: allAdminKeys[index] }))
                                        .filter(item => item.admin.type === "Sub");
  
      // Extract filtered data back into separate arrays
      this.adminData = filteredAdmins.map(item => item.admin);
      this.adminKeys = filteredAdmins.map(item => item.key);
  
      this.isLoading = false;
    });
  }


  deleteAdmin(index:number)
  {
    this.isLoading = true;
    this.apiService.deleteAdmin(this.adminKeys[index]).subscribe((_:any)=>{
      this.toastr.success('Admin Deleted Successfully', 'Notification!' , {
        timeOut : 4000 ,
        closeButton : true , 
        positionClass : 'toast-bottom-right'
      });
      this.getAdmins();
    });
  }

  ngOnDestroy()
  {
    this.utilityService.adminAdded.unsubscribe();
  }
}
