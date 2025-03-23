import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api/api.service';
import { UtilityService } from '../services/utility/utility.service';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit , OnDestroy {

  isLoading : boolean = false;
  ItemsList : any[] = [];
  fullItemsObject: any[] = []; //items combined with keys for search easy.
  filteredItems:any[] = [];
  ItemsKeys : any[] = [];
  fetchError : boolean = false;
  searchInput:string = "";

  noItems : boolean = false;


  categoryKey : string = "";
  categoryName : string = "";

  deleteItemSub : Subscription | undefined;
  updateItemSub: Subscription | undefined;




  constructor(private apiService : ApiService , private route : ActivatedRoute , private utilityService : UtilityService , private router : Router) { }

  ngOnInit(): void {
    this.noItems = false;
    this.isLoading = true;
    this.fetchError = false;
    this.categoryKey = this.route.snapshot.params['categoryKey'];
    this.categoryName = this.route.snapshot.params['categoryName'];

  
   this.deleteItemSub =  this.utilityService.itemDeleted.subscribe((_)=>{
     this.searchInput = "";
     console.log("RECEIVED the deletion confirmation");
      this.loadItems();
    });
    this.updateItemSub = this.utilityService.itemEditted.subscribe((_)=>{
      this.searchInput = "";
      this.loadItems();
    });
    this.loadItems();
  }



  loadItems()
  {
    this.isLoading = true;
    this.ItemsList = [];
    this.ItemsKeys = [];
    this.fullItemsObject = [];
    this.filteredItems = this.fullItemsObject;
    

    this.apiService.getItems(this.categoryKey).subscribe((items : any)=>{
      if(items == null)
      {
        this.ItemsList = [];
        this.ItemsKeys = [];
        this.fullItemsObject = [];
        this.filteredItems = this.fullItemsObject;
        this.isLoading = false;
        this.noItems = true;
        return;
      }
      this.ItemsKeys = Object.keys(items);
      this.ItemsList = Object.values(items);
      this.fullItemsObject = this.combineItemKeys();
      this.filteredItems = this.fullItemsObject;
      this.isLoading = false;
      this.noItems = false;
    })
  }

  combineItemKeys()
  {
    let arr = [];
    for(let i=0;i<this.ItemsList.length;i++)
    {
      let item = this.ItemsList[i];
      item['key'] = this.ItemsKeys[i];
      arr.push(item);
    }
    return arr;
  }

  searchItems()
  {
    this.filteredItems = this.fullItemsObject.filter(item=>{
      let str1 = item.itemName.toUpperCase();
      let str2 = this.searchInput.toUpperCase();
      return str1.includes(str2);
    });
  }
 
  ngOnDestroy()
  {
    if(this.deleteItemSub!=undefined)
    {
      this.deleteItemSub.unsubscribe();
    }
    if(this.updateItemSub!=undefined)
    {
      this.updateItemSub.unsubscribe();
    }
  }

}
