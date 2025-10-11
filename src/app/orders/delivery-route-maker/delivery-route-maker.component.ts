import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-delivery-route-maker',
  templateUrl: './delivery-route-maker.component.html',
  styleUrls: ['./delivery-route-maker.component.scss']
})
export class DeliveryRouteMakerComponent {
  shopsAvailableForDelivery: any[] = [];
  deliveryRoutes: any[] = [];
  uniqueShopsSubscription: Subscription = new Subscription();
  selectedRoute: any = null;
  isLoading:boolean = false;

  constructor(private apiService:ApiService , private utilityService: UtilityService , private toastr:ToastrService) {}

  ngOnInit() {
    this.uniqueShopsSubscription = this.utilityService.sendUniqueShopsForDeliveryRoute.subscribe(
      (shops: any) => {
        if(shops?.length > 0) {
          this.shopsAvailableForDelivery = shops;
        }
      }
    );
  }

  createNewRoute() {
    const newRoute = {
      id: Date.now().toString(),
      driver: '',
      shops: []
    };
    this.deliveryRoutes.push(newRoute);
    this.selectedRoute = newRoute;
  }

  addShopToRoute(shop: any, route: any) {
    const routeShop = {
      ...shop,
      priority: route.shops.length + 1
    };
    route.shops.push(routeShop);
  }

  updateShopPriority(route: any, shop: any, newPriority: number) {
    const shopIndex = route.shops.findIndex((s: any) => s === shop);
    if (shopIndex !== -1) {
      route.shops[shopIndex].priority = newPriority;
      route.shops.sort((a: any, b: any) => a.priority - b.priority);
    }
  }

  assignDriver(route: any, driverName: string) {
    route.driver = driverName;
  }

  saveRouteToDatabase(route:any)
  {
    //for now only saving metadata of a route in database.
    this.isLoading = true;
    this.apiService.saveRouteInDB(route , route.id).subscribe((_:any)=>{
        this.isLoading = false;
        this.toastr.success('Route Saved Successfully', 'Notification!' , {
          timeOut : 4000 ,
          closeButton : true , 
          positionClass : 'toast-top-right'
        });
    })
  }

  sendRouteViaWhatsApp(route: any) 
    {

    }

  ngOnDestroy(){
    if (this.uniqueShopsSubscription) {
      this.uniqueShopsSubscription.unsubscribe();
    }
  }
}