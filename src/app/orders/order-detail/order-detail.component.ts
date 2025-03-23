import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from 'src/app/services/api/api.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent {


  ref:DynamicDialogRef | undefined;
  orderKey : string = "";
  orderDate:string = "";
  isLoading : boolean = false;
  orderData : any = {};
  billData : BillElement[] = [];
  orderedBy : string = "";
  displayedColumns : string[] = [];
  dataSource:any;
  discount:number = 0;
  subTotal:number = 0;
  adminType:any = 'Sub';

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;


  constructor(private dialogService:DialogService,private route : ActivatedRoute , private router : Router,private apiService : ApiService , private toastr : ToastrService , private utilityService:UtilityService) { }

  ngOnInit(): void {
    this.isLoading = false;
    this.orderKey = this.route.snapshot.params['orderKey'];
    this.displayedColumns = ['Sno' , 'Item','Quantity'  , 'Price' , 'Discount', 'Discounted Price'];
    this.adminType = sessionStorage.getItem('adminType');
    this.getOrderItems();
  }

  goBackToOrders()
  {
    this.router.navigate(['/dailyReport']);
  }

  // deleteOrder()
  // {
  //   this.apiService.deleteActiveOrder(this.orderArea , this.orderedBy , this.orderKey).subscribe((_)=>{
  //     this.sureRejectVisible = false;
  //     this.router.navigate(['/dailyReport']);
  //   });
  // }

  getOrderItems()
  {
    this.isLoading = true;
    this.apiService.getOrder(this.orderKey).subscribe((orderDetail:any)=>{
      if(orderDetail == null)
      {
        this.orderData = {};
        this.isLoading = false;
        this.billData = [];
        return;
      }
      this.orderData = orderDetail;
      this.formBillData();
    });
  }

  transformDate(d:string)
  {
    let arr  = d.split("/");
    return arr[1]+"-"+arr[0]+"-"+arr[2];
  }

  formBillData()
  {
    let items = this.orderData['items'];
    this.billData = [];
    for(let i=0;i<items.length;i++)
    {
      let item = items[i].item;
      let data = {"Sno" : i+1 , "Quantity" : items[i].quantity ,"Item" : item ,"Price" : items[i].price , "Discount" : items[i].discount_percentage , "Discounted Price" : items[i].priceAfterDiscount};
      this.billData.push(data);
    }
    this.dataSource = new MatTableDataSource<BillElement>(this.billData);
    this.isLoading=false;
    this.setPaginator();
  }

  setPaginator()
  {
    this.dataSource.paginator = this.paginator;
  }

  acceptOrder()
  {
    let orderInformation = {...this.orderData};
    //orderInformation['items'] = [...this.billData];
    orderInformation['acceptedBy'] = sessionStorage.getItem('loggedInUser');
    console.log("GOING TO API = ");
    console.log(orderInformation);
    orderInformation['orderKey'] = this.orderKey;
    this.isLoading = true;
    this.apiService.acceptOrderForProcessed(orderInformation).subscribe((_)=>{
      this.apiService.deleteActiveOrder(this.orderKey).subscribe((_)=>{
        this.isLoading = false;
        this.router.navigate(['/dailyReport']);
        this.toastr.success('Order Accepted!' , 'Notitfication!' , {
        timeOut : 4000,
        closeButton : true,
        positionClass : 'toast-top-right'
      });
      })
    })
  }

  deleteOrder()
  {
    this.isLoading = true;
    this.apiService.deleteActiveOrder(this.orderKey).subscribe((_)=>{
      this.isLoading = false;
      this.router.navigate(['/dailyReport']);
      this.toastr.success('Order Rejected!' , 'Notitfication!' , {
        timeOut : 4000,
        closeButton : true,
        positionClass : 'toast-top-right'
      });
    });
  }

}

export interface BillElement {
  'Item': string;
  'Quantity' : number;
  'Sno': number;
  'Price': number;
  'Discount': number;
  'Discounted Price' : number;
}


