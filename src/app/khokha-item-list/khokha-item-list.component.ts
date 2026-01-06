import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api/api.service';
import { ActivatedRoute, Router } from '@angular/router';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditKhokhaItemComponent } from '../edit-khokha-item/edit-khokha-item.component';
import { UtilityService } from '../services/utility/utility.service';


@Component({
  selector: 'app-khokha-item-list',
  templateUrl: './khokha-item-list.component.html',
  styleUrls: ['./khokha-item-list.component.scss']
})
export class KhokhaItemListComponent implements OnInit {

  categoryKey!: string;
  items: any[] = [];
  loading = true;
  ref : DynamicDialogRef | undefined;
  deleteItemSub : Subscription | undefined;
  updateItemSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private dialogService: DialogService,
    private utilityService: UtilityService,
  ) {}

  ngOnInit(): void {
    this.categoryKey = this.route.snapshot.paramMap.get('categoryKey')!;
    this.deleteItemSub =  this.utilityService.paanIndiaItemDeleted.subscribe(()=>{
      
      console.log("RECEIVED the deletion confirmation");
       this.fetchItems();
     });
     this.updateItemSub = this.utilityService.paanIndiaItemEditted.subscribe(()=>{
      this.ref?.close();
       this.fetchItems();
     });
    this.fetchItems();
  }

  fetchItems() {
    this.loading = true;
  
    this.apiService
      .getItemsForPaanIndia(this.categoryKey)
      .subscribe({
        next: (res: any) => {
          /**
           * res shape:
           * {
           *   itemId: {
           *     categoryId,
           *     imageUrl,
           *     name,
           *     price,
           *     stock
           *   }
           * }
           */
          this.items = res
            ? Object.entries(res).map(([itemId, item]: any) => ({
                id: itemId,      // preserve Firebase key
                ...item
              }))
            : [];
  
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching items', err);
          this.items = [];
          this.loading = false;
        }
      });
  }
  

  editItem(item: any) {
    this.ref = this.dialogService.open(EditKhokhaItemComponent, { 
            data: {
                item:item
            },
            header: 'Add an item',
            maximizable:true,
            height : "800px",
            width:"600px",
        });
  }

}
