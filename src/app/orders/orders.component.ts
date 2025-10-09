import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api/api.service';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatDatepicker } from '@angular/material/datepicker';


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

  @ViewChild('picker') datepicker!: MatDatepicker<Date>;

  constructor(private apiService: ApiService, private router: Router) {

  }

  ngOnInit(): void {
    this.isLoading = true;
    this.getActiveOrders();
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
          const status = order.status ? order.status.trim().toLowerCase() : '';

          if (!status || status === 'pending') {
            // If status is null/empty/undefined OR explicitly 'pending'
            this.pendingOrders.push(order);
            this.pendingOrdersKeys.push(key);
          } else if (status === 'out-for-delivery') {
            this.outForDeliveryOrders.push(order);
            this.outForDeliveryOrdersKeys.push(key);
          }
        });

        this.isLoading = false;

      }
      else {
        //for Sub-Admins
        // Convert object to array
        console.log("Starting to filter the orders");
        const adminArea = sessionStorage.getItem('loggedInArea');
        const allOrderData = Object.values(orders);
        const allOrderKeys = Object.keys(orders);

        // Filter only those admins where type === "Sub"
        const filteredOrders = allOrderData.map((order, index) => ({ order, key: allOrderKeys[index] }))
          .filter((item: any) => item.order.area.trim().toLowerCase() == adminArea?.trim().toLowerCase());

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
          const status = order.status ? order.status.trim().toLowerCase() : '';

          if (!status || status === 'pending') {
            // If status is null/empty/undefined OR explicitly 'pending'
            this.pendingOrders.push(order);
            this.pendingOrdersKeys.push(key);
          } else if (status === 'out-for-delivery') {
            this.outForDeliveryOrders.push(order);
            this.outForDeliveryOrdersKeys.push(key);
          }
        });

        this.isLoading = false;
      }

    });

  }

  showBill(area: string, orderedBy: string, orderKey: string) {
    this.router.navigate(['orderBill/' + orderKey]);
  }

  oldOrderPage() {
    this.router.navigate(['/processedOrders']);
  }

  downloadCSV() {
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

  downloadTotalParchi(dateFilteredOrders: any) {
    // Step 1: aggregate all items by name
    const totalMap: { [key: string]: number } = {};

    // Loop through all orders
    Object.values(dateFilteredOrders).forEach((order: any) => {
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

  openCalendar() {
    this.datepicker.open();
  }

  onDateChange(e: any) {
    const date: Date = e.value; // this is a Date object
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formatted = `${day}-${month}-${year}`;
    console.log('Formatted:', formatted);

    this.selectedDate = formatted;

    let dateFilteredOrders = this.activeOrders.filter((order: any) => order.orderDate == this.selectedDate);

    console.log(JSON.stringify(dateFilteredOrders));

    this.downloadTotalParchi(dateFilteredOrders);
  }



}
