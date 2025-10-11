import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-delivery-route-maker',
  templateUrl: './delivery-route-maker.component.html',
  styleUrls: ['./delivery-route-maker.component.scss']
})
export class DeliveryRouteMakerComponent {

  shopsAvailableForDelivery:any;
  uniqueShopsSubscription: any;

  constructor(private utilityService : UtilityService) { }
  
    ngOnInit()
    {
      this.uniqueShopsSubscription = this.utilityService.sendUniqueShopsForDeliveryRoute.subscribe(
        (shops: any) => {
          if(shops?.length > 0)
          {
            console.log("Shops received : "+shops);
            this.shopsAvailableForDelivery = shops;
          }
        }
      );
    }

    ngOnDestroy() {
      if (this.uniqueShopsSubscription) {
        this.uniqueShopsSubscription.unsubscribe();
      }
    }

    
}
