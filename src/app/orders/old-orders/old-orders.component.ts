import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from 'src/app/services/api/api.service';
import { OldOrderDetailComponent } from '../old-order-detail/old-order-detail.component';

@Component({
  selector: 'app-old-orders',
  templateUrl: './old-orders.component.html',
  styleUrls: ['./old-orders.component.scss']
})
export class OldOrdersComponent {

  selected : Date | null = null;
  processedOrders: any;
  processedOrderKeys : any;
  isLoading : boolean = false;
  options:any;
  ref:DynamicDialogRef | undefined;

  constructor(private dialogService:DialogService,private apiService : ApiService , private router:Router , private route:ActivatedRoute) { }

  ngOnInit(): void {
    this.isLoading = false;
    this.processedOrders = [];
    this.processedOrderKeys = [];
  }

  changeDate()
  {
    this.isLoading = true;
    let date = this.selected!.getDate();
    let month = this.selected!.getMonth();
    let year = this.selected!.getFullYear();
    let fullDate = date+"-"+(month+1)+"-"+year;
      this.apiService.getProcessedDistributorViewOrders(fullDate).subscribe((orders)=>{
        if(orders == null)
        {
          this.processedOrderKeys= [];
          this.processedOrders = [];
          this.isLoading = false;
          return;
        }
        if(sessionStorage.getItem('adminType')!='Sub')
          {
            //for SuperAdmins
            this.processedOrders = Object.values(orders);
            this.processedOrderKeys = Object.keys(orders);
            this.isLoading = false;
          }
          else
          {
            //for Sub-Admins
            // Convert object to array
            console.log("Starting to filter the orders");
            const admin_username = sessionStorage.getItem('loggedInUser');
          const allOrderData = Object.values(orders);
          const allOrderKeys = Object.keys(orders);
      
          // Filter only those admins where type === "Sub"
          const filteredOrders = allOrderData.map((order, index) => ({ order, key: allOrderKeys[index] }))
                                            .filter((item:any) => item.order.acceptedBy.trim() == admin_username?.trim());
      
          // Extract filtered data back into separate arrays
          this.processedOrders = filteredOrders.map(item => item.order);
          this.processedOrderKeys = filteredOrders.map(item => item.key);
      
          this.isLoading = false;
          }
          
        });
  }

  showBill(order:any , orderKey:any)
  {
    this.ref = this.dialogService.open(OldOrderDetailComponent, { 
      data: {
          key:orderKey,
          order:order,
      },
      header: 'ORDER DETAIL',
      maximizable:true,
      height : "800px",
      width:"600px",
  });
}
}
