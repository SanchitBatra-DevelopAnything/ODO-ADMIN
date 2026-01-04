import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
          this.aggregatedOrder = res.aggregatedOrder;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }
}