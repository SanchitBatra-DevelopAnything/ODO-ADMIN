import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddItemComponent } from '../add-item/add-item.component';
import { UtilityService } from '../services/utility/utility.service';

@Component({
  selector: 'app-category-item',
  templateUrl: './category-item.component.html',
  styleUrls: ['./category-item.component.scss']
})
export class CategoryItemComponent implements OnInit {
  @Input()
  category : any;

  @Input()
  categoryKeyInDb:any;

  ref:DynamicDialogRef | undefined;

  constructor(private dialogService:DialogService , private utilityService:UtilityService , private router:Router) { }

  ngOnInit(): void {
  }

  getCategoryName()
  {
    return this.category.categoryName;
  }

  onAddItem()
  {
    this.ref = this.dialogService.open(AddItemComponent, { 
      data: {
          key:this.categoryKeyInDb,
          category:this.category
      },
      header: 'Add an item',
      maximizable:true,
      height : "800px",
      width:"600px",
  });
  }

  openCategoryScreen(e:any)
  {
    this.router.navigate(['itemsOf/'+this.categoryKeyInDb+"/"+this.getCategoryName()]);
  }
}
