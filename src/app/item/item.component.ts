import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ConfirmationService, ConfirmEventType, MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize, Subscription } from 'rxjs';
import { EditItemComponent } from '../edit-item/edit-item.component';
import { ApiService } from '../services/api/api.service';
import { UtilityService } from '../services/utility/utility.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit , OnDestroy{

  @Input()
  item : any; //comes with a key.

  @Input()
  parentCategoryKey:any; 

  @Input()
  parentCategoryName:any;

  items:MenuItem[] = [];

  isDeleting:boolean = false;

  dialogVisible:boolean = false;

  itemEdittedSubscription:Subscription | undefined;

  ref:DynamicDialogRef | undefined;



  constructor(private storage : AngularFireStorage,private apiService : ApiService , private utilityService : UtilityService , private dialogService:DialogService) { }

  ngOnInit(): void {

    this.itemEdittedSubscription = this.utilityService.itemEditted.subscribe(()=>{
      this.ref?.close();
    });

    this.items = [
      {
          icon: 'pi pi-pencil',
          command: () => {
              this.editItem()
          }
      },
      {
          icon: 'pi pi-trash',
          command: ($event) => {
              this.showDialog();
          }
      },
  ];
  }

  showDialog()
  {
    this.dialogVisible = true; //OK BUTTON IN DIALOG TRIGGERS DELETE METHOD.
  }



  
  deleteItem()
  {
    this.isDeleting = true;
    this.dialogVisible = false;
    this.apiService.deleteItem(this.parentCategoryKey , this.item.key).subscribe((_)=>{
      this.utilityService.itemDeleted.next(this.item.key);
      console.log("sent the key");
      this.isDeleting = false;
    });
  }

  editItem()
  {
    this.ref = this.dialogService.open(EditItemComponent, { 
      data: {
          categoryKey:this.parentCategoryKey,
          key:this.item.key,
          itemData:this.item
      },
      header: 'Edit an item',
      maximizable:true,
      height : "800px",
      width:"600px",
  });

  }

  ngOnDestroy()
  {
    if(this.itemEdittedSubscription!=undefined)
    {
      this.itemEdittedSubscription.unsubscribe();
    }
  }
}
