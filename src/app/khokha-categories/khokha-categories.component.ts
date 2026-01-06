import { Component } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api/api.service';
import { UtilityService } from '../services/utility/utility.service';

@Component({
  selector: 'app-khokha-categories',
  templateUrl: './khokha-categories.component.html',
  styleUrls: ['./khokha-categories.component.scss']
})
export class KhokhaCategoriesComponent {
    isLoading : boolean = false;
    categoryList : any[] = [];
    categoryKeys : any[] = [];
    ref:DynamicDialogRef | undefined;
    paanIndiaCategoryAddedSub:Subscription = new Subscription();
  
    constructor(private apiService:ApiService , private dialogService : DialogService , private utilityService : UtilityService){}
  
    ngOnInit(): void {
      this.loadCategories();
      this.paanIndiaCategoryAddedSub = this.utilityService.categoryAdded.subscribe((_)=>{
        this.loadCategories();
      });
    }
  
    loadCategories()
    {
      this.isLoading = true;
      this.apiService.getCategoriesForPaanIndia().subscribe((allCategories:any)=>{
        this.categoryList = Object.values(allCategories);
        let categoryNames = [];
        for(let i=0;i<this.categoryList.length;i++)
        {
          categoryNames.push({categoryName : this.categoryList[i].categoryName});
        }
        this.categoryKeys = Object.keys(allCategories);
  
        this.isLoading = false;
      });
    }
  
    onDestroy()
    {
      this.paanIndiaCategoryAddedSub.unsubscribe();
    }
}
