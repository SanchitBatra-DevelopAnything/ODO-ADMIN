import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from '../services/api/api.service';


@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss'],
})
export class AddItemComponent implements OnInit{

  ref:DynamicDialogRef | undefined;
  brandKey:string = "";
  fullConfig:any;
  parentBrandData:any;
  task:AngularFireUploadTask | any;
  isLoading:boolean = false;

  addItemForm: FormGroup = new FormGroup({

  });
  photoPreview: string | undefined;
  selectedImage:any;
  areas:any;

  constructor(private config:DynamicDialogConfig , private formBuilder:FormBuilder , private storage:AngularFireStorage , private apiService:ApiService , private toastr:ToastrService){}
  
  ngOnInit()
  {
    this.fullConfig = this.config;
    this.brandKey = this.fullConfig["data"]["key"];
    this.parentBrandData = this.fullConfig["data"]["category"];

    this.addItemForm = this.formBuilder.group({
      itemName: ['', Validators.required],
      itemPrice: ['', Validators.required],
      slab_1_start: [],
      slab_1_end:[],
      slab_1_discount:[],
      slab_2_start: [],
      slab_2_end:[],
      slab_2_discount:[],
      slab_3_start: [],
      slab_3_end:[],
      slab_3_discount:[],
      areaPrices: this.formBuilder.array([])
    });

    this.fetchAreas();
  }

  fetchAreas()
  {
    this.isLoading = true;
    this.apiService.getDistributorships().subscribe((data)=>{
      if (data) {
        this.areas = Object.values(data).map((area:any) => area.areaName);
        this.initializeAreaPrices();
      }
      this.isLoading = false;
    });

  }

  initializeAreaPrices(): void {
    const areaPricesArray = this.addItemForm.get('areaPrices') as FormArray;
    this.areas.forEach((area:any) => {
      areaPricesArray.push(
        this.formBuilder.group({
          areaName: [area.toLowerCase().trim()],
          price: ['']
        })
      );
    });
  }

  get areaPricesControls() {
    return (this.addItemForm.get('areaPrices') as FormArray).controls;
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
    }
    else
    {
      this.selectedImage = null;
    }
  }

  async onSubmit(formValue : any)  {
    if (this.addItemForm.valid) {
      // Process form data here
      this.isLoading = true;
      var filePath = `items/${this.selectedImage.name}_${new Date().getTime()}`;
      var fileRef = this.storage.ref(filePath);
      this.task = this.storage.upload(filePath,this.selectedImage);
      (await this.task).ref.getDownloadURL().then((url:any) => {
          formValue["imgUrl"] = url;
          const formData = this.addItemForm.value;

    // Convert areaPrices FormArray to a map
    const areaPricesMap: { [key: string]: string | number } = {};
    formData.areaPrices.forEach((area:any) => {
      areaPricesMap[area.areaName] = area.price;
    });

    const requestBody = {
      ...formData,
      areaPrices: areaPricesMap
    };
          this.apiService.addItem(requestBody , this.brandKey).subscribe(()=>{
            this.isLoading = false;
            this.toastr.success('Item Added Successfully!', 'Notification!' , {
              timeOut : 4000 ,
              closeButton : true , 
              positionClass : 'toast-top-right'
            });
            this.resetForm();
          });
       });
    } else {
      // Display validation errors or take appropriate action
      console.log("Form is not valid");
    }
  }

  resetForm()
  {
    this.addItemForm.reset();
    this.photoPreview = undefined;
    this.selectedImage = null;
  }

  dummySubmit()
  {
    console.log(this.addItemForm.value);
  }
}

