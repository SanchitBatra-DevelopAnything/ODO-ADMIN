import { Component, Input, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from '../services/api/api.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-add-khokha-item',
  templateUrl: './add-khokha-item.component.html',
  styleUrls: ['./add-khokha-item.component.scss']
})
export class AddKhokhaItemComponent implements OnInit {


  ref: DynamicDialogRef | undefined;
  categoryKey: string = '';
  categoryData: any;
  fullConfig: any;
  itemForm!: FormGroup;
  stores: any[] = [];
  uploading = false;
  imageUrl = '';

  constructor(
    private fb: FormBuilder,
    private storage: AngularFireStorage,
    private apiService: ApiService,
    private toastr: ToastrService,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.fullConfig = this.config;
    this.categoryKey = this.fullConfig['data']['key'];
    this.categoryData = this.fullConfig['data']['category'];
    this.initForm();
    this.fetchStores();
  }

  private initForm() {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      imageUrl: [null, Validators.required],
      stock: this.fb.array([])
    });
  }

  private fetchStores() {
    this.apiService.getPaanIndiaStores().subscribe({
      next: (response) => {
        if (!response) {
          this.stores = [];
          return;
        }
  
        // Convert Firebase object → array
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
      stockArray.push(
        this.fb.group({
          storeName: [store.storeName, Validators.required],
          limit: [0, [Validators.required, Validators.min(0)]]
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
          this.toastr.success('Image uploaded');
        });
      })
    ).subscribe();
  }

  submit() {
    if (this.itemForm.invalid || !this.imageUrl) {
      console.log(this.itemForm);
      this.toastr.error('Please fill all fields');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const stockPayload: any = {};
    this.stockArray.value.forEach((s: any) => {
      stockPayload[s.storeName] = {
        limit: s.limit,
        openingLimit: s.limit,
        openingLimitDate: today,
        value: s.limit
      };
    });

    const payload = {
      categoryId: this.categoryKey,
      name: this.itemForm.value.name,
      price: Number(this.itemForm.value.price),
      imageUrl: this.imageUrl,
      stock: stockPayload
    };

    this.apiService.createKhokhaItem(payload).subscribe({
      next: () => {
        this.toastr.success('Item created successfully');
        this.itemForm.reset();
        this.imageUrl='';
        this.fullConfig = this.config;
    this.categoryKey = this.fullConfig['data']['key'];
    this.initForm();
    this.fetchStores();
      },
      error: () => this.toastr.error('Failed to create item')
    });
  }

}
