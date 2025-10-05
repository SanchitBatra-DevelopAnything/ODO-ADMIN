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
        console.log(JSON.stringify(this.activeOrders));
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

  downloadCSV() {
    const invalidShops = this.activeOrders.filter((order:any) =>
      !order['delivery-latitude'] ||
      !order['delivery-longitude'] ||
      order['delivery-latitude'] === 'not-found' ||
      order['delivery-longitude'] === 'not-found'
    );

    // Step 2: Show alert with bullet-point list of invalid shops (if any)
if (invalidShops.length > 0) {
  // Extract unique shop names
  const uniqueShopNames = Array.from(new Set(invalidShops.map((o: any) => o.shop)));

  // Create bullet list
  const bulletList = uniqueShopNames.map(shop => `• ${shop}`).join('\n');

  // Show alert
  alert(`⚠️ Missing delivery coordinates for the following shops:\n\n${bulletList}`);
}


    // Step 3: Filter valid orders
    const validOrders = this.activeOrders.filter((order:any) =>
      order['delivery-latitude'] &&
      order['delivery-longitude'] &&
      order['delivery-latitude'] !== 'not-found' &&
      order['delivery-longitude'] !== 'not-found'
    );

    if (validOrders.length === 0) {
      alert('❌ No valid coordinates found. CSV not generated.');
      return;
    }

    // Step 4: Generate CSV content
    const header = 'shop,delivery-latitude,delivery-longitude\n';
    const rows = validOrders
      .map((order:any) => `${order.shop},${order['delivery-latitude']},${order['delivery-longitude']}`)
      .join('\n');
    const csvContent = header + rows;

    // Step 5: Trigger CSV download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'shop_locations.csv';
    a.click();

    URL.revokeObjectURL(url);

    // Step 6: Success alert
    alert('✅ CSV file successfully generated with valid shop locations!');
  }


  }
