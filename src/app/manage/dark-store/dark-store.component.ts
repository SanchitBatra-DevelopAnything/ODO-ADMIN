import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { AddDarkStoreComponent } from 'src/app/add-dark-store/add-dark-store.component';
import { ApiService } from 'src/app/services/api/api.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-dark-store',
  templateUrl: './dark-store.component.html',
  styleUrls: ['./dark-store.component.scss']
})
export class DarkStoreComponent implements OnInit , OnDestroy {

  ref:DynamicDialogRef | undefined;
    isLoading:boolean = false;
    darkStoresData:any[] = [];
    darkStoresKeys:any[] = [];
  
    darkStoreAddedSub:Subscription | undefined;
  
    constructor(private apiService:ApiService , private toastr:ToastrService , private dialogService:DialogService , private utilityService:UtilityService){}
  
    ngOnInit()
    {
      this.isLoading = true;
      this.getDarkStores();
      this.utilityService.darkStoreAdded.subscribe((_)=>{
        this.getDarkStores();
        this.ref?.close();
      });
    }
  
    getDarkStores()
    {
      this.isLoading = true;
      this.apiService.getDarkStores().subscribe((darkStores)=>{
        if(darkStores == null)
        {
          this.darkStoresData = [];
          this.darkStoresKeys = [];
          this.isLoading = false;
          return;
        }
        this.darkStoresData = Object.values(darkStores);
        this.darkStoresKeys = Object.keys(darkStores);
        this.isLoading = false;
      });
    }
  
    onAddDarkStore()
    {
      this.ref = this.dialogService.open(AddDarkStoreComponent, { 
        header: 'Add a dark store',
        maximizable:true,
        height : "800px",
        width:"600px",
    });
    }
  
    ngOnDestroy()
    {
      this.darkStoreAddedSub?.unsubscribe();
    }

}
