import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api/api.service';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.categoryKey = this.route.snapshot.paramMap.get('categoryKey')!;
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
    console.log('Edit item:', item);
    // open edit dialog here later
  }

}
