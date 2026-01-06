import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddItemComponent } from '../add-item/add-item.component';
import { UtilityService } from '../services/utility/utility.service';
import { AddKhokhaItemComponent } from '../add-khokha-item/add-khokha-item.component';

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

  @Input()
  paanIndiaCategory:boolean = true;

  ref:DynamicDialogRef | undefined;

  constructor(private dialogService:DialogService , private utilityService:UtilityService , private router:Router) { }

  ngOnInit(): void {
    console.log(
      'paanIndiaCategory =',
      this.paanIndiaCategory,
      'type =',
      typeof this.paanIndiaCategory
    );
  }

  getCategoryName()
  {
    return this.category.categoryName;
  }

  onAddItem()
  {
    if(this.paanIndiaCategory)
    {
      console.log("Opening khokha item add dialog");
      this.ref = this.dialogService.open(AddKhokhaItemComponent, { 
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
    else
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
  }

  openCategoryScreen(e:any)
  {
    if(this.paanIndiaCategory)
    {
      this.router.navigate(['items/paanIndia/'+this.categoryKeyInDb+"/"+this.getCategoryName()]);
    }
    else
    {
      this.router.navigate(['itemsOf/'+this.categoryKeyInDb+"/"+this.getCategoryName()]);
    }
  }
}
