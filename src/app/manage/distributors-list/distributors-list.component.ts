import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-distributors-list',
  templateUrl: './distributors-list.component.html',
  styleUrls: ['./distributors-list.component.scss']
})
export class DistributorsListComponent {

  distributorsData : any[] = [];
  distributorKeys : any[] = [];
  distributorUsefulData : any[] = [];
  isLoading:boolean = false;
  filteredDistributorUsefulData:any[] = [];

  constructor(private apiService : ApiService , private toastr : ToastrService) { }

  ngOnInit(): void {
    this.isLoading = false;
    this.distributorUsefulData = [];
    this.filteredDistributorUsefulData = [];
    this.getDistributors();
  }


  getDistributors()
  {
    this.isLoading = true;
    this.distributorKeys = [];
    this.distributorsData = [];
    this.distributorUsefulData = [];
    this.apiService.getDistributors().subscribe((distributors)=>{
      if(distributors == null)
      {
        this.distributorsData = [];
        this.distributorKeys = [];
        this.distributorUsefulData = [];
        this.isLoading = false;
        return;
      }
      this.distributorsData = Object.values(distributors);
      this.distributorKeys = Object.keys(distributors);
      this.formDistributorsFullData(distributors);
      this.isLoading = false;
    });
  }

  formDistributorsFullData(distributors:any)
  {
    this.distributorUsefulData = [];
    for(let i=0;i<this.distributorKeys.length;i++)
    {
      let obj = {...distributors[this.distributorKeys[i]] , "distributorKey" : this.distributorKeys[i]};
      this.distributorUsefulData.push(obj);
    } 
    this.filteredDistributorUsefulData = [...this.distributorUsefulData];
    console.log(this.filteredDistributorUsefulData);
  }

  deleteDistributor(distributorKey : any)
  {
    this.isLoading = true;
    this.apiService.deleteDistributor(distributorKey).subscribe((_)=>{
      this.toastr.success('Member Deleted Successfully', 'Notification!' , {
        timeOut : 4000 ,
        closeButton : true , 
        positionClass : 'toast-bottom-right'
      });
      this.getDistributors();
    });
  }

  filterDistributors(dataReceivedEvent : any)
  {
    let dataReceived = dataReceivedEvent.target.value;
    if(dataReceived.toString().trim().length == 0)
    {
      this.filteredDistributorUsefulData = [...this.distributorUsefulData];
      return;
    }
    this.filteredDistributorUsefulData = this.distributorUsefulData.filter((distributorObj)=>{
      console.log(distributorObj.distributorKey);
      if(distributorObj.contact.toString().trim().startsWith(dataReceived.toString().trim()))
      {
        return true;
      }
      return false;
    });

    console.log('now it is = '+JSON.stringify(this.filteredDistributorUsefulData));
  }

}
