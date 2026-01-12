import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-aggregated-order-details',
  templateUrl: './aggregated-order-details.component.html',
  styleUrls: ['./aggregated-order-details.component.scss']
})
export class AggregatedOrderDetailsComponent {
  storeId!: string;
  date!: string;
  showPayments = false;
  loading = true;

  aggregatedOrder: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.storeId = this.route.snapshot.paramMap.get('storeId')!;
    this.date = this.route.snapshot.paramMap.get('date')!;
    this.showPayments = this.router.url.includes('/bill');

    this.fetchDetails();
  }

fetchDetails(): void {
  this.loading = true;
  
  this.apiService
    .getKhokhaAggregatedOrderDetail(this.storeId, this.date)
    .subscribe({
      next: (res: any) => {
        const aggregatedOrder = res.aggregatedOrder;

        // Create API calls for each item
        const itemRequests = aggregatedOrder.items.map((item: any) =>
          this.apiService.getKhokhaItemNameFromId(item.itemId).pipe(
            map((itemRes: any) => ({
              ...item,
              itemName: itemRes // adjust key if needed
            }))
          )
        );

        // Execute all calls in parallel
        forkJoin(itemRequests).subscribe({
          next: (itemsWithNames) => {
            this.aggregatedOrder = {
              ...aggregatedOrder,
              items: itemsWithNames
            };
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: () => {
        this.loading = false;
      }
    });
}

}