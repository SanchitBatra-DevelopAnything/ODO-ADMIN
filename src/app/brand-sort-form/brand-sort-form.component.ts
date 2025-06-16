import { Component } from '@angular/core';
import { ApiService } from '../services/api/api.service';


@Component({
  selector: 'app-brand-sort-form',
  templateUrl: './brand-sort-form.component.html',
  styleUrls: ['./brand-sort-form.component.scss']
})
export class BrandSortFormComponent {

  isLoading: boolean = false;
  brands: any = {}; // Store brands data
  objectKeys = Object.keys;
  sortOrderSet = new Set<number>(); // Track used sort orders

  constructor(private apiService: ApiService) {
    this.fetchBrands();
  }

  fetchBrands() {
    this.isLoading = true;
    this.apiService.getBrands().subscribe((data: any) => {
      this.brands = data;
      this.initializeSortOrderSet();
      this.isLoading = false;
    });
  }

  initializeSortOrderSet() {
    this.sortOrderSet.clear();
    Object.values(this.brands).forEach((brand: any) => {
      if (brand.sortOrder) {
        this.sortOrderSet.add(brand.sortOrder);
      }
    });
  }

  onSortOrderChange(key: string, event: any) {
    const newSortOrder = +event.target.value;

    // Prevent duplicate sortOrder
    if (this.sortOrderSet.has(newSortOrder)) {
      // alert(`Sort Order ${newSortOrder} is already assigned. Please choose a unique value.`);
      event.target.value = this.brands[key].sortOrder || ''; // Revert to previous value
      return;
    }

    // Remove old sortOrder from set
    if (this.brands[key].sortOrder) {
      this.sortOrderSet.delete(this.brands[key].sortOrder);
    }

    // Update brand's sortOrder and add new one to set
    this.brands[key].sortOrder = newSortOrder;
    this.sortOrderSet.add(newSortOrder);
  }

  updateSortOrder() {
    this.isLoading = true;
    this.apiService.updateSortOrder(this.brands).subscribe((_ : any) => {
      alert('Sort order updated successfully!');
      this.isLoading = false;
    });
  }

}
