import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { ApiService } from '../services/api/api.service';
import { UtilityService } from '../services/utility/utility.service';

@Component({
  selector: 'app-add-b2b-banner-form',
  templateUrl: './add-b2b-banner-form.component.html',
  styleUrls: ['./add-b2b-banner-form.component.scss']
})
export class AddB2bBannerFormComponent {
  ref: DynamicDialogRef | undefined;
    task: AngularFireUploadTask | any;
    isLoading: boolean = false;
  
    addBannerForm: FormGroup = new FormGroup({
  
    });
    photoPreview: string | undefined;
    selectedImage: any;

    constructor(private config: DynamicDialogConfig, private formBuilder: FormBuilder, private storage: AngularFireStorage, private apiService: ApiService, private toastr: ToastrService , private utilityService:UtilityService) { }

    ngOnInit() {
        this.addBannerForm = this.formBuilder.group({
          bannerName: ['', Validators.required],
        });
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
        else {
          this.selectedImage = null;
        }
      }
    
      async onSubmit(formValue: any) {
        if (this.addBannerForm.valid) {
          // Process form data here
          this.isLoading = true;
          var filePath = `B2BBanners/${this.selectedImage.name}_${new Date().getTime()}`;
          var fileRef = this.storage.ref(filePath);
          this.task = this.storage.upload(filePath, this.selectedImage);
          (await this.task).ref.getDownloadURL().then((url: any) => {
            formValue["imageUrl"] = url;
            this.apiService.uploadB2BBanner(formValue).subscribe((response: any) => {
              const parentKey = response?.name;
              if (parentKey) {
                this.isLoading = false;
                  this.toastr.success('Banner Uploaded Successfully!', 'Close and refresh!', {
                    timeOut: 4000,
                    closeButton: true,
                    positionClass: 'toast-top-right'
                  });
                  this.resetForm();
                  this.utilityService.bannerAdded.next(true);
                  this.ref?.close();
              }
              
            });
          });
        } else {
          // Display validation errors or take appropriate action
        }
      }
    
      resetForm() {
        this.addBannerForm.reset();
        this.photoPreview = undefined;
        this.selectedImage = null;
      }
}
