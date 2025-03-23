import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef , DynamicDialogConfig } from 'primeng/dynamicdialog';


@Component({
  selector: 'app-old-order-detail',
  templateUrl: './old-order-detail.component.html',
  styleUrls: ['./old-order-detail.component.scss']
})
export class OldOrderDetailComponent implements OnInit {

  order:any;

  ref:DynamicDialogRef | undefined;
  items:any;
  selectedSize = "small";

  constructor(private config:DynamicDialogConfig){}

  ngOnInit()
  { 
    this.order = this.config["data"]["order"];
    this.items = this.order['items'];
    console.log(this.order);
  }

}
