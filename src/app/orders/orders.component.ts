import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api/api.service';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatDatepicker } from '@angular/material/datepicker';
import { UtilityService } from '../services/utility/utility.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

  activeOrders: any = [];
  activeOrdersKeys: any = [];
  pendingOrders: any = [];
  pendingOrdersKeys: any = [];
  outForDeliveryOrders: any = [];
  outForDeliveryOrdersKeys: any = [];

  isLoading = false;
  selectedDate: any = null;

  selectedOrdersForTotalParchi: any = [];
  selectionMode = false;
  deliveryPartners:any;

  

  @ViewChild('picker') datepicker!: MatDatepicker<Date>;

  constructor(private apiService: ApiService, private router: Router , private utilityService : UtilityService) {

  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    this.getActiveOrders();
    this.getDeliveryPartners();
  }

  getDeliveryPartners()
  {
    this.isLoading = true;
    this.apiService.getDeliveryPartners().subscribe((res: any) => {
      this.deliveryPartners = Object.keys(res).map(key => ({
        id: key,
        partnerName: res[key].partnerName,
        contact: res[key].contact
      }));
      this.utilityService.setPartners(this.deliveryPartners);
      this.isLoading = false;
    });
  }

  getActiveOrders() {
    console.log("Getting active orders");
    this.apiService.getActiveOrders().subscribe((orders: any) => {
      if (orders == null) {
        this.isLoading = false;
        this.activeOrders = [];
        this.activeOrdersKeys = [];
        return;
      }
      if (sessionStorage.getItem('adminType') != 'Sub') {
        //for SuperAdmins
        this.activeOrders = Object.values(orders);
        this.activeOrdersKeys = Object.keys(orders);

        // Initialize arrays for segregated orders
        this.pendingOrders = [];
        this.pendingOrdersKeys = [];
        this.outForDeliveryOrders = [];
        this.outForDeliveryOrdersKeys = [];

        // Segregate orders based on status
        this.activeOrders.forEach((order: any, index: number) => {
          const key = this.activeOrdersKeys[index];
          const status = order.status ? order.status.trim().toLowerCase() : 'pending';

          if (!status || status === 'pending') {
            // If status is null/empty/undefined OR explicitly 'pending'
            this.pendingOrders.push(order);
            this.pendingOrdersKeys.push(key);
          } else if (status === 'out-for-delivery') {
            this.outForDeliveryOrders.push(order);
            this.outForDeliveryOrdersKeys.push(key);
          }
          //add delivered and pending here later.
        });
      }
      else {
        //for Sub-Admins
        // Convert object to array
        console.log("Starting to filter the orders");
        const adminDarkStoreId = sessionStorage.getItem('loggedInDarkStoreId');
        const allOrderData = Object.values(orders);
        const allOrderKeys = Object.keys(orders);

        // Filter only those admins where type === "Sub"
        const filteredOrders = allOrderData.map((order, index) => ({ order, key: allOrderKeys[index] }))
        .map((item:any) => {
          //this is to have backward compaitibility , in new flow , each order must have a darkStoreId.
          if (!item.order.darkStoreId || item.order.darkStoreId.trim() === '') {
            item.order.darkStoreId = "not-found";
          }
        return item;})
          .filter((item: any) => item.order.darkStoreId == adminDarkStoreId);

          console.log(JSON.stringify(filteredOrders));

        // Extract filtered data back into separate arrays
        this.activeOrders = filteredOrders.map(item => item.order);
        this.activeOrdersKeys = filteredOrders.map(item => item.key);

        // Initialize arrays for segregated orders
        this.pendingOrders = [];
        this.pendingOrdersKeys = [];
        this.outForDeliveryOrders = [];
        this.outForDeliveryOrdersKeys = [];

        // Segregate orders based on status
        this.activeOrders.forEach((order: any, index: number) => {
          const key = this.activeOrdersKeys[index];
          const status = order.status? order.status : 'pending';

          if (!status || status === 'pending') {
            // If status is null/empty/undefined OR explicitly 'pending'
            this.pendingOrders.push(order);
            this.pendingOrdersKeys.push(key);
          } else if (status === 'out-for-delivery') {
            this.outForDeliveryOrders.push(order);
            this.outForDeliveryOrdersKeys.push(key);
          }
        });
      }
      this.isLoading = false;
    });

  }

  isOrderSelected(key: string): boolean {
    return this.selectedOrdersForTotalParchi.some((o:any) => o.key === key);
  }
  

  toggleOrderSelection(order: any, key: any) {
    if (!this.selectionMode) {
      this.showBill(order.shop, order.orderedBy, key);
      return;
    }
  
    const exists = this.selectedOrdersForTotalParchi.find((o:any) => o.key === key);
    if (exists) {
      this.selectedOrdersForTotalParchi = this.selectedOrdersForTotalParchi.filter((o:any) => o.key !== key);
    } else {
      this.selectedOrdersForTotalParchi.push({ order, key });
    }
  }

  enableSelectionMode() {
    this.selectionMode = true;
    this.selectedOrdersForTotalParchi = [];
  }
  
  cancelSelectionMode() {
    this.selectionMode = false;
    this.selectedOrdersForTotalParchi = [];
  }

  sendPendingOrdersForDeliveryRoutes() {
    const shopSet = new Set<{ shop: string; latitude: string; longitude: string; contact: string , address : string }>();
    console.log(this.pendingOrders.length);
    this.pendingOrders.forEach((order: any) => {
      if (order.shop) {
        console.log("Added shop to set");
      shopSet.add({
        shop: order.shop,
        latitude: order['delivery-latitude'] || 'not-found',
        longitude: order['delivery-longitude'] || 'not-found',
        contact: order.contact || 'not-found',
        address : order.shopAddress || 'not-found' 
      });
      }
    });

    // Send data to delivery route making component.
    this.utilityService.setDeliveryShops(Array.from(shopSet));
  }

  showBill(area: string, orderedBy: string, orderKey: string) {
    this.router.navigate(['orderBill/' + orderKey]);
  }

  oldOrderPage() {
    this.router.navigate(['/processedOrders']);
  }

  downloadLocationsCSV() {
    const invalidShops = this.activeOrders.filter((order: any) =>
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
    const validOrders = this.pendingOrders.filter((order: any) =>
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
      .map((order: any) => `${order.shop},${order['delivery-latitude']},${order['delivery-longitude']}`)
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

  generateTotalParchiAndMarkOrdersForDelivery()
  {
    if(this.selectedOrdersForTotalParchi.length == 0)
    {
      alert('No orders selected for Total Parchi generation.');
      return;
    }
    this.isLoading = true;
    this.downloadTotalParchi(this.selectedOrdersForTotalParchi.map((o:any) => o.order));
    //use apiService.updateOrderStatus to mark orders as out-for-delivery
    // const updateRequests = this.selectedOrdersForTotalParchi.map((o: any) => {
    //   return this.apiService.updateOrderStatus(o.key, "out-for-delivery");
    // });
  
    // // Execute all update requests in parallel
    // forkJoin(updateRequests).subscribe({
    //   next: (res) => {
    //     console.log("All selected orders marked out for delivery successfully!", res);
    //     alert("Orders successfully marked as Out for Delivery!");
        
    //     this.isLoading = false;
    //     this.cancelSelectionMode();
    //     this.getActiveOrders();
    //   },
    //   error: (err) => {
    //     console.error("Error updating order statuses", err);
    //     alert("Failed to update some orders. Please retry.");
        
    //     this.isLoading = false;
    //     this.cancelSelectionMode();
    //     this.getActiveOrders();
    //   }
    // });
  }

  downloadTotalParchi(orders: any) {
    // Step 1: aggregate all items by name
    const totalMap: { [key: string]: number } = {};

    // Loop through all orders
    Object.values(orders).forEach((order: any) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const name = item.item.trim().toUpperCase(); // normalize name
          totalMap[name] = (totalMap[name] || 0) + item.quantity;
        });
      }
    });

    // Step 2: convert map to array of objects for Excel
    const dataForExcel = Object.entries(totalMap).map(([item, totalQty]) => ({
      Item: item,
      'Total Quantity': totalQty
    }));


    dataForExcel.sort((a, b) => a.Item.localeCompare(b.Item));

    // Step 3: create worksheet and workbook
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Total Parchi');

    // Step 4: generate Excel file and trigger download
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Total_Parchi_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  // openCalendar() {
  //   this.datepicker.open();
  // }

  //This is the function which was developed to download total parchi based on date orders.
  // onDateChange(e: any) {
  //   const date: Date = e.value; // this is a Date object
  //   const day = date.getDate();
  //   const month = date.getMonth() + 1;
  //   const year = date.getFullYear();

  //   const formatted = `${day}-${month}-${year}`;
  //   console.log('Formatted:', formatted);

  //   this.selectedDate = formatted;

  //   let dateFilteredOrders = this.activeOrders.filter((order: any) => order.orderDate == this.selectedDate);

  //   console.log(JSON.stringify(dateFilteredOrders));

  //   this.downloadTotalParchi(dateFilteredOrders);
  // }

  goToDeliveryRoutePage()
  {
    //send pending orders for delivery route.
    this.sendPendingOrdersForDeliveryRoutes();
    this.router.navigate(['/deliveryRouteMaker']);
  }



}
