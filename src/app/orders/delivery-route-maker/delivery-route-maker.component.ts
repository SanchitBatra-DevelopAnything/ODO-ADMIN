import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
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

  constructor(private utilityService: UtilityService) {}

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