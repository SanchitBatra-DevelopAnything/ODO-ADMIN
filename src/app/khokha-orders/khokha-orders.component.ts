import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-khokha-orders',
  templateUrl: './khokha-orders.component.html',
  styleUrls: ['./khokha-orders.component.scss']
})
export class KhokhaOrdersComponent implements OnInit {
  date: string = this.getTodayIST();
  stores: string[] = [];
  loading = false;

  constructor(private apiService: ApiService , private router:Router) {}

  ngOnInit(): void {
    this.date = this.getTodayIST();
    this.fetch();
  }

  fetch(): void {
    if (!this.date) return;

    this.loading = true;
    this.stores = [];

    this.apiService
      .getKhokhaStoresForActiveKhokhaOrders(this.date)
      .subscribe({
        next: (res: any) => {
          this.stores = res?.stores ?? [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to fetch stores', err);
          this.loading = false;
          this.stores = [];
        }
      });
  }

  /** Always returns today's date in YYYY-MM-DD (IST) */
  private getTodayIST(): string {
    return new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    )
      .toISOString()
      .split('T')[0];
  }

  openDetail(storeId: string) {
    this.router.navigate([
      'aggregated-order-details',
      storeId,
      this.date
    ]);
  }
}
