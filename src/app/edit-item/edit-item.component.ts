import { Component, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from '../services/api/api.service';
import { UtilityService } from '../services/utility/utility.service';

@Component({
  selector: 'app-edit-item',
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.scss'],
})
export class EditItemComponent implements OnInit {
  ref: DynamicDialogRef | undefined;
  itemKey: string = '';
  fullConfig: any;
  itemData: any = {};
  categoryKey: string = '';
  task: AngularFireUploadTask | any;
  isLoading: boolean = false;

  originalUrl: string | undefined;
  photoPreview: string | undefined;
  selectedImage: any;

  editItemForm: FormGroup = new FormGroup({});
  areas: any[] = [];

  constructor(
    private config: DynamicDialogConfig,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private apiService: ApiService,
    private toastr: ToastrService,
    private utilityService: UtilityService
  ) {}

  ngOnInit() {
    this.fullConfig = this.config;
    this.itemKey = this.fullConfig['data']['key'];
    this.itemData = this.fullConfig['data']['itemData'];
    this.categoryKey = this.fullConfig['data']['categoryKey'];

    this.photoPreview = this.itemData['imgUrl'];
    this.originalUrl = this.photoPreview;

    this.editItemForm = this.formBuilder.group({
      itemName: [this.itemData['itemName'], Validators.required],
      itemPrice: [this.itemData['itemPrice'], Validators.required],
      defaultSlab: this.formBuilder.group({
        slab_1_start: [this.itemData['slab_1_start']],
        slab_1_end: [this.itemData['slab_1_end']],
        slab_1_discount: [this.itemData['slab_1_discount']],
        slab_2_start: [this.itemData['slab_2_start']],
        slab_2_end: [this.itemData['slab_2_end']],
        slab_2_discount: [this.itemData['slab_2_discount']],
        slab_3_start: [this.itemData['slab_3_start']],
        slab_3_end: [this.itemData['slab_3_end']],
        slab_3_discount: [this.itemData['slab_3_discount']],
      }),
      areaWiseSlabs: this.formBuilder.array([]),
    });

    this.fetchAreas();
  }

  fetchAreas() {
    this.apiService.getDistributorships().subscribe((areaData) => {
      if (areaData) {
        this.areas = Object.entries(areaData).map(([areaId, areaObj]: [string, any]) => ({
          areaId,
          areaName: areaObj.areaName,
        }));
        this.initializeAreaWiseSlabs(this.itemData.areaSlabs || {});
      }
    });
  }

  initializeAreaWiseSlabs(existingAreaSlabs: { [key: string]: any }) {
    const slabsArray = this.editItemForm.get('areaWiseSlabs') as FormArray;

    this.areas.forEach((area) => {
      const areaKey = area.areaName.toLowerCase().trim();
      const isCustom = !!existingAreaSlabs[areaKey];

      const existingSlab = existingAreaSlabs[areaKey] || {};
      const group = this.formBuilder.group({
        areaName: [areaKey],
        areaId: [area.areaId],
        useDefault: [!isCustom],
        slab_1_start: [{ value: existingSlab.slab_1_start || '', disabled: !isCustom }],
        slab_1_end: [{ value: existingSlab.slab_1_end || '', disabled: !isCustom }],
        slab_1_discount: [{ value: existingSlab.slab_1_discount || '', disabled: !isCustom }],
        slab_2_start: [{ value: existingSlab.slab_2_start || '', disabled: !isCustom }],
        slab_2_end: [{ value: existingSlab.slab_2_end || '', disabled: !isCustom }],
        slab_2_discount: [{ value: existingSlab.slab_2_discount || '', disabled: !isCustom }],
        slab_3_start: [{ value: existingSlab.slab_3_start || '', disabled: !isCustom }],
        slab_3_end: [{ value: existingSlab.slab_3_end || '', disabled: !isCustom }],
        slab_3_discount: [{ value: existingSlab.slab_3_discount || '', disabled: !isCustom }],
      });

      slabsArray.push(group);
    });
  }

  get areaWiseSlabsControls() {
    return (this.editItemForm.get('areaWiseSlabs') as FormArray).controls;
  }

  onToggleUseDefault(index: number) {
    const control = (this.editItemForm.get('areaWiseSlabs') as FormArray).at(index);
    const useDefault = control.get('useDefault')?.value;
  
    for (let i = 1; i <= 3; i++) {
      const prefix = `slab_${i}_`;
  
      const startCtrl = control.get(`${prefix}start`);
      const endCtrl = control.get(`${prefix}end`);
      const discountCtrl = control.get(`${prefix}discount`);
  
      if (useDefault) {
        // Clear and disable fields
        startCtrl?.setValue('');
        endCtrl?.setValue('');
        discountCtrl?.setValue('');
  
        startCtrl?.disable();
        endCtrl?.disable();
        discountCtrl?.disable();
      } else {
        // Enable fields (user can now enter custom values)
        startCtrl?.enable();
        endCtrl?.enable();
        discountCtrl?.enable();
      }
    }
  }
  

  onFileChange(event: any) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.photoPreview = reader.result as string;
      };
      this.selectedImage = event.target.files[0];
    } else {
      this.selectedImage = null;
    }
  }

  async onSubmit(formValue: any) {
    if (this.editItemForm.valid) {
      this.isLoading = true;
      const saveWithImageUrl = async (url: string) => {
        const formData = this.editItemForm.value;

        const areaSlabs: { [key: string]: any } = {};
        formData.areaWiseSlabs.forEach((area: any) => {
          if (!area.useDefault) {
            const { areaName, areaId, useDefault, ...slabs } = area;
            areaSlabs[areaName] = {
              areaId,
              ...slabs,
            };
          }
        });

        const requestBody = {
          itemName: formData.itemName,
          itemPrice: formData.itemPrice,
          imgUrl: url,
          ...formData.defaultSlab,
          areaSlabs,
        };

        this.apiService.editItem(this.categoryKey, this.itemKey, requestBody).subscribe(() => {
          this.utilityService.itemEditted.next(this.itemKey);
          this.isLoading = false;
          this.toastr.success('Item Edited Successfully!', 'Notification!', {
            timeOut: 4000,
            closeButton: true,
            positionClass: 'toast-top-right',
          });
          this.resetForm();
        });
      };

      if (this.originalUrl !== this.photoPreview) {
        const filePath = `items/${this.selectedImage.name}_${new Date().getTime()}`;
        this.task = this.storage.upload(filePath, this.selectedImage);
        (await this.task).ref.getDownloadURL().then((url: string) => saveWithImageUrl(url));
      } else {
        saveWithImageUrl(this.originalUrl!);
      }
    }
  }

  resetForm() {
    this.editItemForm.reset();
    this.photoPreview = undefined;
    this.originalUrl = undefined;
    this.selectedImage = null;
  }
}
