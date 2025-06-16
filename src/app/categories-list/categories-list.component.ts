import { Component } from '@angular/core';
import { ApiService } from '../services/api/api.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BrandOnboardComponent } from '../brand-onboard/brand-onboard.component';
import { UtilityService } from '../services/utility/utility.service';
import { Subscribable, Subscription } from 'rxjs';
import { BrandSortFormComponent } from '../brand-sort-form/brand-sort-form.component';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss']
})
export class CategoriesListComponent {

  isLoading : boolean = false;
  brandList : any[] = [];
  brandKeys : any[] = [];
  ref:DynamicDialogRef | undefined;
  brandAddedSub:Subscription = new Subscription();

  constructor(private apiService:ApiService , private dialogService : DialogService , private utilityService : UtilityService){}

  ngOnInit(): void {
    this.loadCategories();
    this.brandAddedSub = this.utilityService.categoryAdded.subscribe((_)=>{
      this.loadCategories();
    });
  }

  loadCategories()
  {
    this.isLoading = true;
    this.apiService.getBrands().subscribe((allBrands:any)=>{
      this.brandList = Object.values(allBrands);
      let brandNames = [];
      for(let i=0;i<this.brandList.length;i++)
      {
        brandNames.push({categoryName : this.brandList[i].brandName});
      }
      this.brandKeys = Object.keys(allBrands);

      this.isLoading = false;
    });
  }

  onBrandOnboard()
  {
       this.ref = this.dialogService.open(BrandOnboardComponent, { 
          header: 'Onboard a brand.',
          maximizable:true,
          height : "800px",
          width:"600px",
      });
  }

  openSortOrder()
  {
    this.ref = this.dialogService.open(BrandSortFormComponent , {
      header : 'Sort your brands',
      maximizable:true,
      height : "800px",
      width : "600px",
    });
  }

  onDestroy()
  {
    this.brandAddedSub.unsubscribe();
  }

}
