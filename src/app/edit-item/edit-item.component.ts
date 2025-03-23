import { Component } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from '../services/api/api.service';
import { UtilityService } from '../services/utility/utility.service';

@Component({
  selector: 'app-edit-item',
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.scss']
})
export class EditItemComponent {

  ref: DynamicDialogRef | undefined;
  itemKey: string = "";
  fullConfig: any;
  itemData: any = {};
  categoryKey: string = "";
  task: AngularFireUploadTask | any;
  isLoading: boolean = false;

  originalUrl: string | undefined;

  editItemForm: FormGroup = new FormGroup({

  });
  photoPreview: string | undefined;
  selectedImage: any;

  constructor(private config: DynamicDialogConfig, private formBuilder: FormBuilder, private storage: AngularFireStorage, private apiService: ApiService, private toastr: ToastrService, private utilityService: UtilityService) { }

  ngOnInit() {
    this.fullConfig = this.config;
    this.itemKey = this.fullConfig["data"]["key"];
    this.itemData = this.fullConfig["data"]["itemData"];
    this.categoryKey = this.fullConfig["data"]["categoryKey"];

    // console.log("RECEIVED ITEM DATA = "+JSON.stringify(this.fullConfig["data"]["itemData"]));


    this.editItemForm = this.formBuilder.group({
      itemName: [this.itemData["itemName"], Validators.required],
      itemPrice: [this.itemData["itemPrice"], Validators.required],
      slab_1_start: [this.itemData["slab_1_start"]],
      slab_1_end: [this.itemData["slab_1_end"]],
      slab_1_discount: [this.itemData["slab_1_discount"]],
      slab_2_start: [this.itemData["slab_2_start"]],
      slab_2_end: [this.itemData["slab_2_end"]],
      slab_2_discount: [this.itemData["slab_2_discount"]],
      slab_3_start: [this.itemData["slab_3_start"]],
      slab_3_end: [this.itemData["slab_3_end"]],
      slab_3_discount: [this.itemData["slab_3_discount"]],
      areaPrices: this.formBuilder.array([])
    });

    this.photoPreview = this.itemData["imgUrl"];
    this.originalUrl = this.photoPreview; //set original url as the url originally , photoPreview will change if new image is selected.
    this.fetchAreas();

  }

  fetchAreas() {
    this.apiService.getDistributorships().subscribe((areaData) => {
      if (areaData) {
        const areas = Object.values(areaData).map((area: any) => area.areaName);
        this.initializeAreaPrices(areas, this.itemData.areaPrices || {});
      }
    });
  }

  initializeAreaPrices(areas: string[], existingAreaPrices: { [key: string]: number }): void {
    const areaPricesArray = this.editItemForm.get('areaPrices') as FormArray;
    areas.forEach((area) => {
      areaPricesArray.push(
        this.formBuilder.group({
          areaName: [area.trim().toLowerCase()],
          price: [existingAreaPrices[area.trim().toLowerCase()] ?? ''] // Pre-fill price if exists
        })
      );
    });
  }

  get areaPricesControls() {
    return (this.editItemForm.get('areaPrices') as FormArray).controls;
  }




  onFileChange(event: any) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.photoPreview = reader.result as string; //image changed , original url != photoPreview now.
      };
      this.selectedImage = event.target.files[0];
    }
    else {
      this.selectedImage = null;
    }
  }

  async onSubmit(formValue: any) {
    if (this.editItemForm.valid) {
      // Process form data here
      this.isLoading = true;
      if (this.originalUrl != this.photoPreview) {
        var filePath = `items/${this.selectedImage.name}_${new Date().getTime()}`;
        var fileRef = this.storage.ref(filePath);
        this.task = this.storage.upload(filePath, this.selectedImage);
        (await this.task).ref.getDownloadURL().then((url: any) => {
          formValue["imgUrl"] = url;
          const formData = this.editItemForm.value;

          // Convert areaPrices FormArray to a map, filtering out empty prices
          const areaPricesMap: { [key: string]: number } = {};
          formData.areaPrices.forEach((area: any) => {
            if (area.price) { // Only add if price is provided
              areaPricesMap[area.areaName] = Number(area.price);
            }
          });

          const requestBody = {
            ...formData,
            areaPrices: areaPricesMap
          };
          this.apiService.editItem(this.categoryKey, this.itemKey, requestBody).subscribe(() => {
            this.utilityService.itemEditted.next(this.itemKey);
            this.isLoading = false;
            this.toastr.success('Item Editted Successfully , Please close the form!', 'Notification!', {
              timeOut: 4000,
              closeButton: true,
              positionClass: 'toast-top-right'
            });
            this.resetForm();
          });
        });
      }
      else {
        //photo was same , only update the items content.
        formValue["imgUrl"] = this.originalUrl;
        const formData = this.editItemForm.value;

          // Convert areaPrices FormArray to a map, filtering out empty prices
          const areaPricesMap: { [key: string]: number } = {};
          formData.areaPrices.forEach((area: any) => {
            if (area.price) { // Only add if price is provided
              areaPricesMap[area.areaName] = Number(area.price);
            }
          });

          const requestBody = {
            ...formData,
            areaPrices: areaPricesMap
          };
        this.apiService.editItem(this.categoryKey, this.itemKey, requestBody).subscribe((_) => {
          this.utilityService.itemEditted.next(this.itemKey);
          this.isLoading = false;
          this.toastr.success('Item Editted Successfully , Please close the form!', 'Notification!', {
            timeOut: 4000,
            closeButton: true,
            positionClass: 'toast-top-right'
          });
          this.resetForm();
        });
      }
    } else {
      // Display validation errors or take appropriate action
    }
  }

  resetForm() {
    this.editItemForm.reset();
    this.photoPreview = undefined;
    this.originalUrl = this.photoPreview;
    this.selectedImage = null;
  }

}
