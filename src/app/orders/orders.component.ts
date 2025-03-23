import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit{

  activeOrders:any = [];
  activeOrdersKeys :any= [];
  isLoading = false;

  constructor(private apiService:ApiService , private router:Router)
  {

  }

  ngOnInit() : void{
    this.isLoading = true;
    this.getActiveOrders();
  }

  getActiveOrders()
  {
    console.log("Getting active orders");
    this.apiService.getActiveOrders().subscribe((orders:any)=>{
      if(orders == null)
      {
        this.isLoading = false;
        this.activeOrders = [];
        this.activeOrdersKeys = [];
        return;
      }
      if(sessionStorage.getItem('adminType')!='Sub')
      {
        //for SuperAdmins
        this.activeOrders = Object.values(orders);
        this.activeOrdersKeys = Object.keys(orders);
        this.isLoading = false;
      }
      else
      {
        //for Sub-Admins
        // Convert object to array
        console.log("Starting to filter the orders");
        const adminArea = sessionStorage.getItem('loggedInArea');
      const allOrderData = Object.values(orders);
      const allOrderKeys = Object.keys(orders);
  
      // Filter only those admins where type === "Sub"
      const filteredOrders = allOrderData.map((order, index) => ({ order, key: allOrderKeys[index] }))
                                        .filter((item:any) => item.order.area.trim().toLowerCase() == adminArea?.trim().toLowerCase());
  
      // Extract filtered data back into separate arrays
      this.activeOrders = filteredOrders.map(item => item.order);
      this.activeOrdersKeys = filteredOrders.map(item => item.key);
  
      this.isLoading = false;
      }
      
    });
    
  }

  showBill(area:string , orderedBy : string, orderKey:string)
  {
    this.router.navigate(['orderBill/'+orderKey]);
  }

  oldOrderPage()
  {
    this.router.navigate(['/processedOrders']);
  }
}
