import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss'],
})
export class AddItemComponent implements OnInit {
  ref: DynamicDialogRef | undefined;
  categoryKey: string = '';
  fullConfig: any;
  parentCategoryData: any;
  task: any;
  isLoading: boolean = false;

  addItemForm: FormGroup = new FormGroup({});
  photoPreview: string | undefined;
  selectedImage: any;
  areas: any;

  constructor(
    private config: DynamicDialogConfig,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private apiService: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.fullConfig = this.config;
    this.categoryKey = this.fullConfig['data']['key'];
    this.parentCategoryData = this.fullConfig['data']['category'];

    this.addItemForm = this.formBuilder.group({
      itemName: ['', Validators.required],
      itemPrice: ['', Validators.required],
      defaultSlab: this.formBuilder.group({
        slab_1_start: [],
        slab_1_end: [],
        slab_1_discount: [],
        slab_2_start: [],
        slab_2_end: [],
        slab_2_discount: [],
        slab_3_start: [],
        slab_3_end: [],
        slab_3_discount: [],
      }),
      areaWiseSlabs: this.formBuilder.array([]),
    });

    this.fetchAreas();
  }

  fetchAreas() {
    this.isLoading = true;
    this.apiService.getDistributorships().subscribe((data) => {
      if (data) {
        this.areas = Object.values(data).map((area: any) => area.areaName);
        this.initializeAreaWiseSlabs();
      }
      this.isLoading = false;
    });
  }

  initializeAreaWiseSlabs(): void {
    const slabsArray = this.addItemForm.get('areaWiseSlabs') as FormArray;
    this.areas.forEach((area: any) => {
      slabsArray.push(
        this.formBuilder.group({
          areaName: [area.toLowerCase().trim()],
          useDefault: [true],
          slab_1_start: [{ value: '', disabled: true }],
          slab_1_end: [{ value: '', disabled: true }],
          slab_1_discount: [{ value: '', disabled: true }],
          slab_2_start: [{ value: '', disabled: true }],
          slab_2_end: [{ value: '', disabled: true }],
          slab_2_discount: [{ value: '', disabled: true }],
          slab_3_start: [{ value: '', disabled: true }],
          slab_3_end: [{ value: '', disabled: true }],
          slab_3_discount: [{ value: '', disabled: true }],
        })
      );
    });
  }

  get areaWiseSlabsControls() {
    return (this.addItemForm.get('areaWiseSlabs') as FormArray).controls;
  }

  onToggleUseDefault(index: number) {
    const control = (this.addItemForm.get('areaWiseSlabs') as FormArray).at(index);
    const useDefault = control.get('useDefault')?.value;
    const defaultSlab = this.addItemForm.get('defaultSlab')?.value;

    for (let i = 1; i <= 3; i++) {
      const prefix = `slab_${i}_`;

      if (useDefault) {
        control.get(`${prefix}start`)?.disable();
        control.get(`${prefix}end`)?.disable();
        control.get(`${prefix}discount`)?.disable();

        control.get(`${prefix}start`)?.setValue(defaultSlab[`${prefix}start`]);
        control.get(`${prefix}end`)?.setValue(defaultSlab[`${prefix}end`]);
        control.get(`${prefix}discount`)?.setValue(defaultSlab[`${prefix}discount`]);
      } else {
        control.get(`${prefix}start`)?.enable();
        control.get(`${prefix}end`)?.enable();
        control.get(`${prefix}discount`)?.enable();
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
    if (this.addItemForm.valid) {
      this.isLoading = true;

      const filePath = `items/${this.selectedImage.name}_${new Date().getTime()}`;
      const fileRef = this.storage.ref(filePath);
      this.task = this.storage.upload(filePath, this.selectedImage);
      (await this.task).ref.getDownloadURL().then((url: any) => {
        formValue['imgUrl'] = url;
        const formData = this.addItemForm.value;

        const areaSlabs: { [key: string]: any } = {};
        formData.areaWiseSlabs.forEach((area: any) => {
          const { areaName, useDefault, ...slabData } = area;
          areaSlabs[areaName] = slabData;
        });

        const requestBody = {
          itemName: formData.itemName,
          itemPrice: formData.itemPrice,
          imgUrl: formValue.imgUrl,
          ...formData.defaultSlab,
          areaSlabs: areaSlabs,
        };

        this.apiService.addItem(requestBody, this.categoryKey).subscribe(() => {
          this.isLoading = false;
          this.toastr.success('Item Added Successfully!', 'Notification!', {
            timeOut: 4000,
            closeButton: true,
            positionClass: 'toast-top-right',
          });
          this.resetForm();
        });
      });
    } else {
      console.log('Form is not valid');
    }
  }

  resetForm() {
    this.addItemForm.reset();
    this.photoPreview = undefined;
    this.selectedImage = null;
  }
}
