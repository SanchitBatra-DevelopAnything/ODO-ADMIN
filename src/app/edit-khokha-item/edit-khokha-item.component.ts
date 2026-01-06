import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ApiService } from '../services/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { UtilityService } from '../services/utility/utility.service';

@Component({
  selector: 'app-edit-khokha-item',
  templateUrl: './edit-khokha-item.component.html',
  styleUrls: ['./edit-khokha-item.component.scss']
})
export class EditKhokhaItemComponent implements OnInit {

  itemForm!: FormGroup;
  
  categoryData: any;

  stores: any[] = [];
  itemData: any;

  imageUrl = '';
  uploading = false;
  fullConfig:any;

  constructor(
    private fb: FormBuilder,
    private storage: AngularFireStorage,
    private apiService: ApiService,
    private toastr: ToastrService,
    private config: DynamicDialogConfig,
    private utilityService:UtilityService
  ) {}

  ngOnInit(): void {
    this.itemData = this.config.data.item;
    console.log(this.itemData);

    this.initForm();
    this.loadItem();
    this.fetchStores();
  }

  private initForm() {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      imageUrl: [null],
      stock: this.fb.array([])
    });
  }

  private loadItem() {
    this.itemForm.patchValue({
      name: this.itemData.name,
      price: this.itemData.price,
      imageUrl: this.itemData.imageUrl
    });
    this.imageUrl = this.itemData.imageUrl;
  }

  private fetchStores() {
    this.apiService.getPaanIndiaStores().subscribe({
      next: (response) => {
        if (!response) return;

        this.stores = Object.keys(response).map(storeId => ({
          storeId,
          storeName: response[storeId].storeName
        }));

        this.buildStockControls();
      },
      error: () => this.toastr.error('Failed to fetch stores')
    });
  }

  private buildStockControls() {
    const stockArray = this.stockArray;
    stockArray.clear();

    this.stores.forEach(store => {
      const existing = this.itemData.stock?.[store.storeName];

      stockArray.push(
        this.fb.group({
          // 🔒 STORE NAME LOCKED
          storeName: [{ value: store.storeName, disabled: true }],
          limit: [
            existing ? existing.limit : 0,
            [Validators.required, Validators.min(0)]
          ]
        })
      );
    });
  }

  get stockArray(): FormArray {
    return this.itemForm.get('stock') as FormArray;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.uploading = true;
    const filePath = `khokhaItems/${Date.now()}_${file.name}`;
    const fileRef = this.storage.ref(filePath);

    this.storage.upload(filePath, file).snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {
          this.imageUrl = url;
          this.itemForm.patchValue({ imageUrl: url });
          this.uploading = false;
          this.toastr.success('Image updated');
        });
      })
    ).subscribe();
  }

  submit() {
    if (this.itemForm.invalid) {
      this.toastr.error('Please fix form errors');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const stockPayload: any = {};

    // ✅ IMPORTANT: use getRawValue() for disabled controls
    this.stockArray.getRawValue().forEach((s: any) => {
      const prev = this.itemData.stock?.[s.storeName];

      stockPayload[s.storeName] = {
        limit: s.limit,
        openingLimit: prev?.openingLimit ?? s.limit,
        openingLimitDate: prev?.openingLimitDate ?? today,
        value: prev?.value ?? s.limit
      };
    });

    const payload = {
      name: this.itemForm.value.name,
      price: Number(this.itemForm.value.price),
      imageUrl: this.itemForm.value.imageUrl,
      stock: stockPayload
    };

    this.apiService.updateKhokhaItem(this.itemData.id, payload).subscribe({
      next: () => {
        this.toastr.success('Item updated successfully')
        this.utilityService.paanIndiaItemEditted.next(this.itemData.id);
        this.itemForm.reset();
        this.imageUrl = '';
      },
      error: () => this.toastr.error('Failed to update item')
    });
  }
}
