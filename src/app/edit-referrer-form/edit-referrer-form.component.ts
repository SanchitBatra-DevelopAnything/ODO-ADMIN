import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-edit-referrer-form',
  templateUrl: './edit-referrer-form.component.html',
  styleUrls: ['./edit-referrer-form.component.scss']
})
export class EditReferrerFormComponent {

  editReferrerForm!: FormGroup;
  isLoading = true;

  referrerId: string = '';
  darkStores: any[] = [];
  darkStoreKeys: string[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.referrerId = this.config.data?.referrerId;

    // ✅ Initialize empty form first
    this.editReferrerForm = this.fb.group({
      businessName: ['', Validators.required],
      referrerName: ['', Validators.required],
      contact: ['', Validators.required],
      darkStoreId: ['', Validators.required]
    });

    this.loadReferrerAndDarkStores();
  }

  loadReferrerAndDarkStores() {
    this.isLoading = true;
    console.log("ReferrerID captured  : "+this.referrerId);
    // ✅ Get both in parallel
    this.apiService.getReferrer(this.referrerId).subscribe(referrerData => {
      this.apiService.getDarkStores().subscribe(darkStoresData => {

        if (darkStoresData) {
          this.darkStores = Object.values(darkStoresData);
          this.darkStoreKeys = Object.keys(darkStoresData);
        }

        // ✅ Patch values after fetching both
        this.editReferrerForm.patchValue({
          businessName: referrerData.businessName,
          referrerName: referrerData.referrerName,
          contact: referrerData.contact,
          darkStoreId: referrerData.darkStoreId // ✅ Dropdown preselects correct one
        });

        this.isLoading = false;
      });
    });
  }

  onSubmit() {
    if (this.editReferrerForm.invalid) return;

    this.isLoading = true;

    this.apiService.editReferrer(this.referrerId, this.editReferrerForm.value)
      .subscribe(() => {
        console.log("Referrer updated successfully!");
        this.router.navigate(['/referrers']); // redirect
      });
  }
}
